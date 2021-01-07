const WebSocket = require('ws')
const { toJSON } = require("../../../lib/helper/assist");
const { logger } = require('../../../lib/log')

class Pool {
    constructor(chain, callback) {
        this.servers = [];
        this.callback = callback
        for (var i = 0; i < config.pool; i++) {
            let index = Math.floor(Math.random() * config.chain[chain].ws.length)
            this.servers.push(this.connect(i, chain, config.chain[chain].ws[index]))
        }

    }
    connect(index, chain, path) {
        let server = new WebSocket(path)
        let handle_error = async (error) => {
            logger.error('server ws error ', error)
            server.terminate()
            this.servers[index] = this.connect(index, chain, path)
            console.log('reconnect ', index, chain, path)
        }
        server.on('unexpected-response', handle_error)
        server.on('error', handle_error)
        server.on('close', handle_error)
        server.on('open', function (m) {
            console.log('open', chain)
        })
        server.on('message', this.callback)
        return server
    }
    send(index, msg) {
        index = (Buffer.from(index).readUIntLE(0, 4)) % this.servers.length
        this.servers[index].send(toJSON(msg))
    }
}
module.exports = Pool