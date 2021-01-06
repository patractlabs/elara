const { logger } = require('../../../lib/log')
const kafka = require("../../../lib/kafka")
const CODE = require('../../../lib/helper/code')
const { isUnsafe, unSubscription } = require('../../../lib/helper/check')
const { toJSON, fromJSON } = require("../../../lib/helper/assist")
const Pool = require("./pool")
class Messengers {
    constructor() {
        this.ws = {}
        this.http = {}
        this.messengers = {}
        //加载所有消息通道
        for (let chain in config.messengers) {
            this.messengers[chain] = new Pool(chain, config.messengers[chain][0], async (message) => {
                message = fromJSON(message)
                if (this.http[message.id]) {
                    this.http[message.id].callback(message.response)
                    delete this.http[message.id]
                }
                else if (this.ws[message.id]) {
                    if (this.ws[message.id].client) {
                        try {
                            //console.log(message)
                            this.ws[message.id].client.send(toJSON(message.response))
                            this.report(message.id, message.response)//上报
                        } catch (e) {
                            //这里如果出错，就要去messenger取消订阅
                            //console.log(e)
                            this.sendUnSubscription(message)
                        }
                    }
                    else {
                        delete this.ws[message.id]
                    }
                    //上报
                }
                else {
                    this.sendUnSubscription(message)
                }
            })
        }
    }
    sendUnSubscription(message) {
        if (message.response.params && message.response.params.subscription) {
            if (unSubscription(message.response.method)) {
                this.messengers[message.chain].send({
                    "id": message.id,
                    "chain": message.chain,
                    "request": {
                        "jsonrpc": message.jsonrpc,
                        "method": unSubscription(message.response.method),
                        "params": [message.response.params.subscription],
                        "id": 1
                    }
                })
            }
        }
    }

    wsClient(id, client, chain, pid, request) {
        this.ws[id] = { id, client, chain, pid, request }
        this.ws[id].client.removeAllListeners('message')
        this.ws[id].client.on('message', (message) => {
            if (!(message.trim()))
                return
            try {
                let params = fromJSON(message)
                if (isUnsafe(params)) {
                    this.ws[id].client.send(JSON.stringify({
                        "jsonrpc": params.jsonrpc,
                        "error": CODE.UNSAFE_METHOD,
                        "id": params.id
                    }))
                    return
                }

                if (this.messengers[chain]) {
                    if (global.message[id].length) {
                        for (var i = 0; i < global.message[id].length; i++) {
                            this.messengers[chain].send({
                                "id": id,
                                "chain": chain,
                                "request": fromJSON(global.message[id][i])
                            })
                        }
                        global.message[id] = []
                    }
                    this.messengers[chain].send({
                        "id": id,
                        "chain": chain,
                        "request": params
                    })
                }
            } catch (e) {
                logger.error('send message error ', chain, message, e)
            }
        })
        this.ws[id].client.on('close', (code, reason) => {
            this.ws[id].client = null
        })
        this.ws[id].client.on('error', function (error) {
            this.ws[id].client.terminate()
            this.ws[id].client = null
            logger.error('client ws error ', error)
        })

    }
    httpClient(id, chain, pid, request, callback) {
        this.http[id] = { id, chain, pid, request, callback }
        this.messengers[chain].send({
            "id": id,
            "chain": chain,
            "request": request
        })
    }

    report(id, response) {
        try {
            if (this.ws[id] && this.ws[id].request) {
                let request = this.ws[id].request
                let ip = (request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(/\s*,\s/[0]) : null) || request.socket.remoteAddress || ''

                kafka.stat({
                    'key': 'request',
                    'message': {
                        protocol: 'websocket',
                        header: request.headers,
                        ip: ip,
                        chain: this.ws[id].chain,
                        pid: this.ws[id].pid,
                        method: response.method?response.method:'',
                        req: '',
                        resp: '',//暂时用不上，省空间 message,
                        code: 200,
                        bandwidth: toJSON(response).length,
                        start: 0,
                        end: 0
                    }
                })
            }

        } catch (e) {
            logger.error('Stat Error', e)
        }
    }
}

module.exports = Messengers