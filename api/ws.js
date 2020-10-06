const Result = require('../lib/result')
const WebSocket = require('ws')
const { logger } = require('../lib/log')
const Stat = require("../api/stat")

let websocketPair = new Set()

class SocketPair {
    constructor(client, chain, pid, request) {
        this.client = client
        this.server = new WebSocket('ws://' + config.chain[chain].ws[0])
        this.chain = chain
        this.pid = pid
        this.request = request

        this.req = ''
        this.reqMethod = ''
        this.reqStartTime = 0

        websocketPair.add(this)

        this.server.on('unexpected-response', async (req, resp) => {
            logger.error('unexpected-response', resp.statusCode, resp.statusMessage)
            this.client.terminate()
            this.server.terminate()
            websocketPair.delete(this)

            await this.report()
        })

        this.server.on('error', async (error) => {
            logger.error('ws error ', error)
            logger.error(error)
            this.client.terminate()
            this.server.terminate()
            websocketPair.delete(this)

            await this.report()
        })
        this.server.on('close', (error) => {
            logger.error(error)
            this.client.terminate()
            websocketPair.delete(this)
        })

        this.server.on('message', async (message) => {
            this.client.send(message)
            await this.report(message)

        })
        this.client.on('message', (message) => {
            if (!(message.trim()))
                return

            this.req = message
            try {
                let params = JSON.parse(this.req)
                this.reqMethod = params.method
            } catch (e) {
            }
            this.reqStartTime = (new Date()).getTime()
            this.server.send(message)
        })
        this.client.on('close', (code, reason) => {
            websocketPair.delete(this)
            this.server.terminate()
        })
        this.client.on('error', function (error) {
            this.server.terminate()
            this.client.terminate()
            websocketPair.delete(this)
            logger.error('ws error ', error)
        })
    }
    async report(message) {
        let end = (new Date()).getTime()
        try {
            let ip = (this.request.headers['x-forwarded-for'] ? this.request.headers['x-forwarded-for'].split(/\s*,\s/[0]) : null) || this.request.socket.remoteAddress || ''

            await Stat.stat({
                protocol: 'websocket',
                header: this.request.headers,
                ip: ip,
                chain: this.chain,
                pid: this.pid,
                method: this.reqMethod,
                req: this.req,
                resp: message,
                code: message ? 200 : 404,
                bandwidth: message.length,
                start: this.reqStartTime,
                end: end
            })
        } catch (e) {
            logger.error('Stat Error', e)
        }
    }
}

module.exports = SocketPair