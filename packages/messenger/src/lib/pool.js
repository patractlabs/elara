const WebSocket = require('ws')
const {
    toJSON,
    sleep
} = require("../../../lib/helper/assist");
const {
    logger
} = require('../../../lib/log')
const crypto = require("crypto");

class Pool {
    constructor(name, chain, msgCallback, closeCallback) {
        this.name = name;
        this.chain = chain
        this.servers = [];
        this.msgCallback = msgCallback
        this.closeCallback = closeCallback
        for (var i = 0; i < config.pool; i++) {
            let index = Math.floor(Math.random() * config[name][chain].ws.length)
            this.servers.push({
                id: Buffer.from(crypto.randomBytes(16)).toString('hex'),
                ws: this.connect(i, name, chain, config[name][chain].ws[index]),
                channel_clientID: new Set()
            })
        }
    }
    connect(index, name, chain, path) {
        let server = new WebSocket(path)
        server.on('error', async (error) => {
            logger.error('server ws error ', error, index, name, chain, path)
        })
        server.on('close', async (error) => {
            logger.error('server ws close ', error)
            let {
                ws,
                channel_clientID
            } = this.servers[index]
            ws.removeAllListeners()
            ws.close()
            //定时，不要即时
            await sleep(5000)
            this.closeCallback(channel_clientID) //回调通知
            channel_clientID.clear()
            this.servers[index].ws = this.connect(index, name, chain, path)
            console.log('reconnect ', index, name, chain, path)
        })

        server.on('open', async () => {
            console.log('open ', index, name, chain)
            server.on('message', this.msgCallback)
        })
        return server
    }
    send(id, req) {
        let index = (Buffer.from(id).readUIntLE(0, 4)) % this.servers.length
        const {
            ws,
            channel_clientID
        } = this.servers[index]
        if (WebSocket.OPEN != ws.readyState) {
            ws.close()
            return false
        }
        channel_clientID.add(id) //更新集合
        ws.send(toJSON(req))

        return true
    }
    sendKV(id, req) { //Just for 订阅管理器
        let index = (Buffer.from(id).readUIntLE(0, 4)) % this.servers.length
        const {
            ws,
            id: serverId,
            channel_clientID
        } = this.servers[index]
        if (WebSocket.OPEN != ws.readyState) {
            ws.close()
            return false
        }
        channel_clientID.add(id) //更新集合
        ws.send(toJSON({
            id: serverId,
            chain: this.chain,
            request: toJSON(req)
        }))

        return true
    }
}
module.exports = Pool