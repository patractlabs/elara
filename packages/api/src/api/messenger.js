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
                        this.messengers[chain].messengers[index].channel_clientID.delete(message.id)
                    } else if (this.conWs[message.id]) {
                        if (message.id && message.response.cmd == 'close' && this.conWs[message.id].ws) {
                            //特定的关闭客户端命令 关闭连接
                            this.wsClose(message.id, message.chain)
                            logger.info('Close Client', message.id)
                        } else {
                            try {
                                const msg = toJSON(message.response)
                                const buffer = Buffer.from(msg);
                                const len = buffer.length;
                                const maxReceivedMessageSize = 1024 * 1024;
                                const maxBufferLen = 1024 * 64;
                                if (len > maxReceivedMessageSize) {
                                    for ( let i = 0; i <= Math.floor(len % maxBufferLen); i++ ) {
                                        if (i !== Math.floor(len % maxBufferLen)) {
                                            const str = buffer.slice(i * maxBufferLen, (i + 1) * maxBufferLen).toString();
                                            this.conWs[message.id].ws.send(str, { fin: false });
                                        } else {
                                            const str = buffer.slice(i * maxBufferLen).toString();
                                            this.conWs[message.id].ws.send(str, {fin: true});
                                        }
                                    }
                                } else {
                                    this.conWs[message.id].ws.send(msg);
                                }
                                // 订阅映射，用于app主动断开时，取消messenger内存空间
                                if (message.response.params && message.response.params.subscription) {
                                    if (!this.conWs[message.id].unsubscription_msg) {
                                        this.conWs[message.id].unsubscription_msg = {}
                                    }
                                    if (!this.conWs[message.id].unsubscription_msg[config['un-subscription'][message.response.method]]) {
                                        this.conWs[message.id].unsubscription_msg[config['un-subscription'][message.response.method]] = new Set()
                                    }
                                    this.conWs[message.id].unsubscription_msg[config['un-subscription'][message.response.method]].add(message.response.params.subscription)
                                }
                                this.report(message.id, message.response) //上报
                            } catch (e) {
                                //这里如果出错，就要去messenger取消订阅
                                logger.error('ws send error', e)
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
                        if(this.conWs[id]) {
                            this.conWs[id].ws.removeAllListeners()
                            this.conWs[id].ws.close()
                            delete this.conWs[id]
                            logger.info('Close & Del Client', chain, id)
                        }
                    })
                }
            )
        }
        setInterval(() => {
            let length = 0;
            for (let chain in config.messengers) {
                for (let messenger of this.messengers[chain].messengers) {
                    length += messenger.channel_clientID.size
                }
            }
            console.log(`channel_clientID: ${length}`)
        }, 10000)
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

    wsClient(id, ws, request, chain, pid) {
        this.conWs[id] = {
            ws,
            request,
            chain,
            pid
        };
        console.log(`wsClients: ${Object.keys(this.conWs).length}`)
        this.conWs[id].ws.on('message', (message) => {
            try {
                if (!(message.trim()))
                    return
                let params = fromJSON(message)
                if (isUnsafe(params)) {
                    this.conWs[id].ws.send(JSON.stringify({
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
                this.conWs[id].ws.send(JSON.stringify({
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

        this.conWs[id].ws.on('close', () => {
            // when apps is broken, delete cache value
            this.wsClose(id, chain)
        })

        this.conWs[id].ws.on('error', (error) => {
            this.wsClose(id, chain)
            logger.error('client ws error ', error)
        })
    }

    wsClose(id, chain) {
        for (let method in this.conWs[id].unsubscription_msg) {
            for (let subId of this.conWs[id].unsubscription_msg[method]) {
                this.messengers[chain].send({
                    "id": id,
                    "chain": chain,
                    "request": {
                        "jsonrpc": '2.0',
                        "method": method,
                        "params": [subId],
                        "id": 1
                    }
                })
            }
        }
        for (let messenger of this.messengers[chain].messengers) {
            if (messenger.channel_clientID.has(id)) {
                messenger.channel_clientID.delete(id)
                break;
            }
        }
        this.conWs[id].ws.removeAllListeners()
        this.conWs[id].ws.close()
        delete this.conWs[id]
        console.log(`wsClose: ${Object.keys(this.conWs).length}`)
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
        console.log(`httpClients: ${Object.keys(this.http).length};`)
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