const {
    logger
} = require('../../../lib/log')
const kafka = require("../../../lib/kafka")
const CODE = require('../../../lib/helper/code')
const {
    isUnsafe,
    unSubscription
} = require('../../../lib/helper/check')
const {
    toJSON,
    fromJSON
} = require("../../../lib/helper/assist")
const Pool = require("./pool")
class Messengers {
    constructor() {
        this.http = {}
        this.messengers = {}
        //加载所有消息通道
        for (let chain in config.messengers) {
            this.messengers[chain] = new Pool(
                chain,
                config.messengers[chain][0],
                (message) => {
                    message = fromJSON(message)
                    if (this.http[message.id]) {
                        this.http[message.id].callback(message.response)
                        delete this.http[message.id]
                    } else if (global.conWs[message.id]) {
                        if (message.id && message.response.cmd == 'close' && global.conWs[message.id].ws) {
                            //特定的关闭客户端命令 关闭连接
                            this.wsClose(message.id)
                            logger.info('Close Client', message.id)
                        } else {
                            try {
                                global.conWs[message.id].ws.send(toJSON(message.response))
                                this.report(message.id, message.response) //上报
                            } catch (e) {
                                //这里如果出错，就要去messenger取消订阅
                                //console.log(e)
                                this.sendUnSubscription(message)
                            }
                        }
                        //上报
                    } else {
                        this.sendUnSubscription(message)
                    }
                },
                (closeClientIDs) => {
                    if (closeClientIDs.size === 0) return
                    //节点的链路断了,通知客户端关闭重连
                    closeClientIDs.forEach((id) => {
                        
                        //特定命令协议
                        if(global.conWs[id]) {
                            global.conWs[id].ws.removeAllListeners()
                            global.conWs[id].ws.close()
                            delete global.conWs[id]
                            logger.info('Close & Del Client', chain, id)
                        }
                    })
                }
            )
        }
    }
    sendUnSubscription(message) {
        if (message.response.params && message.response.params.subscription) {
            if (unSubscription(message.response.method)) {
                // delete this.subscription_msg[message.response.params.subscription]
                this.messengers[message.chain].send({
                    "id": message.id,
                    "chain": message.chain,
                    "request": {
                        "jsonrpc": message.response.jsonrpc,
                        "method": unSubscription(message.response.method),
                        "params": [message.response.params.subscription],
                        "id": 1
                    }
                })
            }
        }
    }

    wsClient(id, chain, pid) {
        const {
            ws,
            request
        } = global.conWs[id];
        global.conWs[id] = {
            ws,
            request,
            chain,
            pid
        };
        global.conWs[id].ws.on('message', (message) => {
            try {
                if (!(message.trim()))
                    return
                let params = fromJSON(message)
                if (isUnsafe(params)) {
                    global.conWs[id].ws.send(JSON.stringify({
                        "jsonrpc": params.jsonrpc,
                        "error": CODE.UNSAFE_METHOD,
                        "id": params.id
                    }))
                    return
                }

                if (this.messengers[chain]) {
                    this.messengers[chain].send({
                        "id": id,
                        "chain": chain,
                        "request": params
                    })
                }
            } catch (e) {
                global.conWs[id].ws.send(JSON.stringify({
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32700,
                        "message": "Parse error"
                    },
                    "id": null
                }))
                logger.error('send message error ', chain, message, e)
            }
        })

        global.conWs[id].ws.on('close', () => {
            // when apps is broken, delete cache value
            this.wsClose(id)
        })

        global.conWs[id].ws.on('error', (error) => {
            this.wsClose(id)
            logger.error('client ws error ', error)
        })
    }

    wsClose(id) {
        global.conWs[id].ws.removeAllListeners()
        global.conWs[id].ws.close()
        delete global.conWs[id]
    }

    httpClient(id, chain, request, callback) {
        this.http[id] = {
            callback
        }
        this.messengers[chain].send({
            "id": id,
            "chain": chain,
            "request": request
        })
    }

    report(id, response) {
        try {
            if (global.conWs[id] && global.conWs[id].request) {
                let request = global.conWs[id].request
                let ip = (request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(/\s*,\s/ [0]) : null) || request.socket.remoteAddress || ''

                kafka.stat({
                    'key': 'request',
                    'message': {
                        protocol: 'websocket',
                        header: request.headers,
                        ip: ip,
                        chain: global.conWs[id].chain,
                        pid: global.conWs[id].pid,
                        method: response.method ? response.method : 'system_health',
                        req: '',
                        resp: '', //暂时用不上，省空间 message,
                        code: 200,
                        bandwidth: toJSON(response).length,
                        start: (new Date()).getTime(),
                        end: (new Date()).getTime()
                    }
                })
            }

        } catch (e) {
            logger.error('Stat Error', e)
        }
    }
}

module.exports = Messengers