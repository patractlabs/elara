const WebSocket = require('ws')
const {
    logger
} = require('../../../lib/log')
const kafka = require("../../../lib/kafka")
const CODE = require('../../../lib/helper/code')
const {
    toJSON,
    sleep
} = require("../../../lib/helper/assist")

class Pool {
    constructor(chain, path, callback, oncloseCallback) {
        this.messengers = [];
        this.callback = callback
        this.oncloseCallback = oncloseCallback
        for (var i = 0; i < config.pool; i++) {
            this.messengers.push({
                ws: this.initConnect(i, chain, path),
                channel_clientID: new Set()
            })
        }
    }
    initConnect(index, chain, path) {
        let mess = new WebSocket(path)
        mess.on('error', async (error) => {
            logger.error('server ws error ', error, index, chain, path)
        })
        mess.on('close', async (error) => {
            logger.error('server ws close ', error)
            const {
                channel_clientID,
                ws
            } = this.messengers[index]
            ws.removeAllListeners()
            ws.close()
            await sleep(5000)
            this.oncloseCallback(channel_clientID)
            channel_clientID.clear()
            this.messengers[index].ws = this.initConnect(index, chain, path) //重连
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
        const {
            channel_clientID,
            ws
        } = this.messengers[index]
        channel_clientID.add(msg.id)
        if (ws.readyState !== WebSocket.OPEN) {
            ws.close()
            return
        }
        ws.send(toJSON(msg))
    }
}
module.exports = Pool