const { logger } = require('../../../lib/log')
const kafka = require('../../../lib/kafka')
const CODE = require('../../../lib/helper/code')
const { isUnsafe, unSubscription } = require('../../../lib/helper/check')
const { toJSON, fromJSON } = require('../../../lib/helper/assist')
const Pool = require('./pool')
class Messengers {
    constructor() {
        this.ws = {}
        this.http = {}
        this.messengers = {}
        //加载所有消息通道
        for (let chain in config.messengers) {
            this.messengers[chain] = new Pool(
                chain, // chainName polkadot | kusama
                config.messengers[chain][0], // messagers ws path
                async (message) => {
                    // on message callback from messagers services
                    message = fromJSON(message)
                    if (this.http[message.id]) {
                        // response defined in messagers/routers.js
                        // the pattern is {id:xx, chain:xx, response}
                        this.http[message.id].callback(message.response)
                        delete this.http[message.id]
                    } else if (this.ws[message.id]) {
                        if (this.ws[message.id].client) {
                            try {
                                // notify personal client
                                this.ws[message.id].client.send(
                                    toJSON(message.response)
                                )
                                // report to stat services
                                this.report(message.id, message.response)
                            } catch (e) {
                                //这里如果出错，就要去messenger取消订阅
                                console.log('sendUnSubscription 1', message.id)
                                this.sendUnSubscription(message)
                            }
                        } else {
                            console.log('sendUnSubscription 2', message.id)
                            delete this.ws[message.id]
                        }
                        //上报
                    } else {
                        console.log('sendUnSubscription 3', message.id)
                        this.sendUnSubscription(message)
                    }
                }
            )
        }
    }

    sendUnSubscription(message) {
        if (message.response.params && message.response.params.subscription) {
            if (unSubscription(message.response.method)) {
                // communicate with messagers to unsubscribe ws connection
                this.messengers[message.chain].send({
                    id: message.id,
                    chain: message.chain,
                    request: {
                        jsonrpc: message.jsonrpc,
                        method: unSubscription(message.response.method),
                        params: [message.response.params.subscription],
                        id: 1,
                    },
                })
            }
        }
    }

    /**
     *
     * @param {string} id client unique id
     * @param {*} client api ws客户端
     * @param {*} chain path-chain
     * @param {*} pid path-pid
     * @param {*} request request对象
     */
    wsClient(id, client, chain, pid, request) {
        this.ws[id] = { id, client, chain, pid, request }
        this.ws[id].client.removeAllListeners('message')
        this.ws[id].client.on('message', (message) => {
            if (!message.trim()) return
            try {
                let params = fromJSON(message)
                // illegal call
                if (isUnsafe(params)) {
                    this.ws[id].client.send(
                        JSON.stringify({
                            jsonrpc: params.jsonrpc,
                            error: CODE.UNSAFE_METHOD,
                            id: params.id,
                        })
                    )
                    return
                }

                if (this.messengers[chain]) {
                    if (global.message[id].length) {
                        for (var i = 0; i < global.message[id].length; i++) {
                            this.messengers[chain].send({
                                id: id,
                                chain: chain,
                                request: fromJSON(global.message[id][i]),
                            })
                        }
                        global.message[id] = []
                    }
                    this.messengers[chain].send({
                        id: id,
                        chain: chain,
                        request: params,
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
            id: id,
            chain: chain,
            request: request,
        })
    }

    report(id, response) {
        try {
            if (this.ws[id] && this.ws[id].request) {
                let request = this.ws[id].request
                let ip =
                    (request.headers['x-forwarded-for']
                        ? request.headers['x-forwarded-for'].split(/\s*,\s/[0])
                        : null) ||
                    request.socket.remoteAddress ||
                    ''

                kafka.stat({
                    key: 'request',
                    message: {
                        protocol: 'websocket',
                        header: request.headers,
                        ip: ip,
                        chain: this.ws[id].chain,
                        pid: this.ws[id].pid,
                        method: response.method
                            ? response.method
                            : 'system_health',
                        req: '',
                        resp: '', //暂时用不上，省空间 message,
                        code: 200,
                        bandwidth: toJSON(response).length,
                        start: new Date().getTime(),
                        end: new Date().getTime(),
                    },
                })
            }
        } catch (e) {
            logger.error('Stat Error', e)
        }
    }
}

module.exports = Messengers
