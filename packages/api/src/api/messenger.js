const WebSocket = require('ws')
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
        this.conWs = {}
        this.http = {}
        this.messengers = {}
        //加载所有消息通道
        for (let chain in config.messengers) {
            this.messengers[chain] = new Pool(
                chain,
                config.messengers[chain][0],
                (message, index) => {
                    message = fromJSON(message)
                    if (this.http[message.id]) {
                        this.http[message.id].callback(message.response)
                        delete this.http[message.id]
                    } else if (this.conWs[message.id]) {
                        if (message.response.cmd == 'close' && this.conWs[message.id].ws) {
                            //特定的关闭客户端命令 关闭连接
                            this.wsClose(message.id)
                            logger.info('Close Client', message.id)
                        } else {
                            try {
                                const msg = toJSON(message.response)
                                const len = Buffer.from(msg).length;
                                const maxReceivedMessageSize = 1024 * 1024;
                                const maxBufferLen = 1024 * 64;
                                if (len > maxReceivedMessageSize) {
                                    const buffer = Buffer.from(msg);
                                    for (
                                        let i = 0; i <= Math.floor(len % maxBufferLen); i++
                                    ) {
                                        if (i !== Math.floor(len % maxBufferLen)) {
                                            const str = buffer
                                                .slice(
                                                    i * maxBufferLen,
                                                    (i + 1) * maxBufferLen
                                                )
                                                .toString();
                                            this.conWs[message.id].ws.send(str, {
                                                fin: false,
                                            });
                                        } else {
                                            const str = buffer
                                                .slice(i * maxBufferLen)
                                                .toString();
                                            this.conWs[message.id].ws.send(str, {
                                                fin: true,
                                            });
                                        }
                                    }
                                } else {
                                    this.conWs[message.id].ws.send(msg);
                                }
                                this.report(message.id, message.response) //上报
                            } catch (e) {
                                //这里如果出错，就要去messenger取消订阅
                                //console.log(e)
                                this.wsClose(message.id)
                                console.log('ws send error', e)
                            }
                        }
                        //上报
                    } else if (message.response.cmd == 'teardown') {
                        const startTime = new Date().getTime()
                        if (message.response.type === 'channel') {
                            const messengers = this.messengers[chain].messengers
                            messengers[index].channel_clientID = new Set(message.response.data)
                        } else {
                            for (let id in this.conWs) {
                                if (message.response.data.indexOf(id) === -1) {
                                    this.wsClose(id)
                                }
                            }
                        }
                        console.log(`teardown ${chain} time: ${new Date().getTime() - startTime}ms`)


                    } else {
                        // 取消订阅的消息
                        this.sendUnSubscription(message)
                    }
                },
                (closeClientIDs) => {
                    if (closeClientIDs.size === 0) return
                    //节点的链路断了,通知客户端关闭重连
                    closeClientIDs.forEach((id) => {

                        //特定命令协议
                        if (this.conWs[id]) {
                            this.wsClose(id)
                            logger.info('Close & Del Client', chain, id)
                        }
                    })
                }
            )
        }
        setInterval(() => {
            const startTime = new Date().getTime()
            for (let id in this.conWs) {
                if (this.conWs[id].ws.readyState !== WebSocket.OPEN) {
                    console.log('ws status error', this.conWs[id].ws.readyState);
                    this.wsClose(id)
                }
            }
            let length = 0;
            for (let chain in config.messengers) {
                for (let messenger of this.messengers[chain].messengers) {
                    length += messenger.channel_clientID.size
                }
            }
            console.log(`api gc time: ${new Date().getTime() - startTime}, clients: ${length}`)
        }, 30000)
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
            console.log('unexceptionMsg', message.id, message.response.params.subscription)
        }
    }

    wsClient(id, ws, request, chain, pid) {
        this.conWs[id] = {
            ws,
            request,
            chain,
            pid
        };
        console.log(`wsClient: ${Object.keys(this.conWs).length}; http: ${Object.keys(this.http).length};`)
        ws.on('message', (message) => {
            try {
                if (!(message.trim()))
                    return
                let params = fromJSON(message)
                if (isUnsafe(params)) {
                    ws.send(JSON.stringify({
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
                ws.send(JSON.stringify({
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

        ws.on('close', () => {
            // when apps is broken, delete cache value
            this.wsClose(id)
        })

        ws.on('error', (error) => {
            this.wsClose(id)
            logger.error('client ws error ', error)
        })
    }

    wsClose(id) {
        const {
            chain,
            ws
        } = this.conWs[id]
        this.messengers[chain].send({
            "id": id,
            "chain": chain,
            "request": {
                gc: true
            }
        })
        for (let messenger of this.messengers[chain].messengers) {
            if (messenger.channel_clientID.has(id)) {
                messenger.channel_clientID.delete(id)
                break;
            }
        }
        ws.removeAllListeners()
        ws.close()
        delete this.conWs[id]
        console.log(`wsClose: ${Object.keys(this.conWs).length}; http: ${Object.keys(this.http).length};`)
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
        // rescue for rpc error
        const timer = setTimeout(() => {
            if (this.http[id]) {
                delete this.http[id]
            }
            clearTimeout(timer)
        }, 10000)
    }

    report(id, response) {
        try {
            if (this.conWs[id] && this.conWs[id].request) {
                let request = this.conWs[id].request
                let ip = (request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(/\s*,\s/ [0]) : null) || request.socket.remoteAddress || ''

                kafka.stat({
                    'key': 'request',
                    'message': {
                        protocol: 'websocket',
                        header: request.headers,
                        ip: ip,
                        chain: this.conWs[id].chain,
                        pid: this.conWs[id].pid,
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