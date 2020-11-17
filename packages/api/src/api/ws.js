const Result = require('../lib/result')
const WebSocket = require('ws')
const { logger } = require('../lib/log')
const kafka = require("./kafka")

let websocketPair = new Set()

class SocketPair {
    constructor(id, client, chain, pid, request) {
        let index=Math.floor(Math.random()*config.chain[chain].ws.length)
        this.id = id
        this.client = client
        this.server = new WebSocket(config.chain[chain].ws[index])
        this.chain = chain
        this.pid = pid
        this.request = request

        this.req = ''
        this.reqMethod = ''
        this.mapStartTime = {}

        websocketPair.add(this)

        this.server.on("open", () => {
            for (let m in global.message[this.id]) {
                this.server.send(global.message[this.id][m])
            }
            global.message[this.id] = []
        })
        this.server.on('unexpected-response', async (req, resp) => {
            logger.error('unexpected-response', resp.statusCode, resp.statusMessage)
            this.client.terminate()
            this.server.terminate()
            websocketPair.delete(this)
        })

        this.server.on('error', async (error) => {
            logger.error('server ws error ', error)
            this.client.terminate()
            this.server.terminate()
            websocketPair.delete(this)
        })
        this.server.on('close', (error) => {
            logger.error(error)
            this.client.terminate()
            websocketPair.delete(this)
        })

        this.server.on('message', async (message) => {
            let start = 0
            let end = 0
            try {
                let resp = JSON.parse(message)
                if (resp.id && this.mapStartTime[resp.id]) {
                    start = this.mapStartTime[resp.id]
                    end = (new Date()).getTime()
                }
                else {
                    start = end = (new Date()).getTime()
                }
            } catch (e) {
            }

            this.client.send(message)
            this.report(message, start, end)
        })

        this.client.removeAllListeners('message')
        this.client.on('message', (message) => {
            if (!(message.trim()))
                return

            this.req = message
            try {
                let params = JSON.parse(this.req)
                this.reqMethod = params.method
                if (params.id)
                    this.mapStartTime[params.id] = (new Date()).getTime() //start time 
            } catch (e) {
            }

            if (this.server.readyState != 1) {
                global.message[this.id].push(message)
            }
            else {
                this.server.send(message)
            }
        })
        this.client.on('close', (code, reason) => {
            websocketPair.delete(this)
            this.server.terminate()
        })
        this.client.on('error', function (error) {
            this.server.terminate()
            this.client.terminate()
            websocketPair.delete(this)
            logger.error('client ws error ', error)
        })
    }
    report(message, start, end) {
        try {
            let ip = (this.request.headers['x-forwarded-for'] ? this.request.headers['x-forwarded-for'].split(/\s*,\s/[0]) : null) || this.request.socket.remoteAddress || ''

            kafka.stat({
                'key': 'request',
                'message': {
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
                    start: start,
                    end: end
                }
            })
        } catch (e) {
            logger.error('Stat Error', e)
        }
    }
}

module.exports = SocketPair