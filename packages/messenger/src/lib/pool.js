const WebSocket = require('ws')
const { toJSON, sleep } = require("../../../lib/helper/assist");
const { logger } = require('../../../lib/log')
const crypto = require("crypto");

class Pool {
    constructor(name, chain, callback) {
        this.name = name;
        this.chain = chain
        this.servers = [];
        this.ids = [];
        this.callback = callback
        for (var i = 0; i < config.pool; i++) {
            let index = Math.floor(Math.random() * config[name][chain].ws.length)
            this.servers.push(this.connect(i, name, chain, config[name][chain].ws[index]))
            this.ids.push((Buffer.from(crypto.randomBytes(16)).toString('hex')))
        }
    }
    connect(index, name, chain, path) {
        let server = new WebSocket(path)
        server.on('error', async (error) => {
            logger.error('server ws error ', error, index, name, chain, path)
        })
        server.on('close', async (error) => {
            logger.error('server ws close ', error)
            this.servers[index].close()
            //定时，不要即时
            await sleep(5000)
            this.servers[index] = this.connect(index, name, chain, path)
            console.log('reconnect ', index, name, chain, path)
        })

        server.on('open', async () => {
            console.log('open ', index, name, chain)
            server.on('message', this.callback)
        })

        return server
    }
    send(index, msg) {
        index = (Buffer.from(index).readUIntLE(0, 4)) % this.servers.length
        this.servers[index].send(toJSON(msg))
    }
    sendKV(index, msg) {//Just for 订阅管理器
        index = (Buffer.from(index).readUIntLE(0, 4)) % this.servers.length
        if (WebSocket.OPEN != this.servers[index].readyState) {
            return false
        }
        this.servers[index].send(toJSON({
            id: this.ids[index],
            chain: this.chain,
            request: toJSON(msg)
        }))

        return true
    }
}
module.exports = Pool