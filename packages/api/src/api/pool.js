const WebSocket = require('ws')
const { logger } = require('../../../lib/log')
const kafka = require("../../../lib/kafka")
const CODE = require('../../../lib/helper/code')
const { toJSON, sleep } = require("../../../lib/helper/assist")

class Pool {
    constructor(chain, path, callback) {
        this.messengers = [];
        this.callback = callback
        for (var i = 0; i < config.pool; i++) {
            this.messengers.push(this.initConnect(i, chain, path))
        }
    }
    initConnect(index, chain, path) {
        let mess = new WebSocket(path)
        mess.on('error', async (error) => {
            logger.error('server ws error ', error, index, chain, path)
        })
        mess.on('close', async (error) => {
            logger.error('server ws error ', error)
            mess.terminate()
            await sleep(5000)
            this.messengers[index] = this.initConnect(index, chain, path)//重连
            console.log('reconnect ', index, chain, path)
        })
        mess.on('open', async () => {
            console.log(chain + " messenger open")
            mess.on('message', this.callback)
        })

        return mess
    }
    send(msg) {
        let index = (Buffer.from(msg.id).readUIntLE(0, 4)) % this.messengers.length
        this.messengers[index].send(toJSON(msg))
    }
}
module.exports = Pool