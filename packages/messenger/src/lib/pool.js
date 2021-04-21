const WebSocket = require('ws')
const { toJSON, sleep } = require("../../../lib/helper/assist");
const { logger } = require('../../../lib/log')
const crypto = require("crypto");

class Pool {
    constructor(name, chain, msgCallback,closeCallback) {
        this.name = name;
        this.chain = chain
        this.servers = [];
        this.ids = [];
        this.channel_clientID=[];// 信道=>客户端ID  (1=>N) 为了在信道断开的时候通知客户端关闭重连
        this.msgCallback = msgCallback
        this.closeCallback=closeCallback
        for (var i = 0; i < config.pool; i++) {
            let index = Math.floor(Math.random() * config[name][chain].ws.length)
            this.servers.push(this.connect(i, name, chain, config[name][chain].ws[index]))
            this.ids.push((Buffer.from(crypto.randomBytes(16)).toString('hex')))
        }
    }
    connect(index, name, chain, path) {
        let server = new WebSocket(path)
        this.channel_clientID[index]=new Set() //新建集合
        server.on('error', async (error) => {
            logger.error('server ws error ', error, index, name, chain, path)
        })
        server.on('close', async (error) => {
            logger.error('server ws close ', error)
            this.servers[index].close()
            this.closeCallback(this.channel_clientID[index]) //回调通知
            delete  this.channel_clientID[index];
            //定时，不要即时
            await sleep(5000)
            this.servers[index] = this.connect(index, name, chain, path)
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
        this.channel_clientID[index].add(id) //更新集合
        this.servers[index].send(toJSON(req))
    }
    sendKV(id, req) {//Just for 订阅管理器
        let index = (Buffer.from(id).readUIntLE(0, 4)) % this.servers.length
        if (WebSocket.OPEN != this.servers[index].readyState) {
            return false
        }
        this.channel_clientID[index].add(id) //更新集合

        this.servers[index].send(toJSON({
            id: this.ids[index],
            chain: this.chain,
            request: toJSON(req)
        }))

        return true
    }
}
module.exports = Pool