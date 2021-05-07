const WebSocket = require('ws')
const {
    logger
} = require('../../lib/log')

const CODE = require('../../lib/helper/code')
const {
    toJSON
} = require("../../lib/helper/assist")

class Router {
    constructor() {
        this.clients = {}
        this.processors = {}
        this.unsubscription_msg = {}
        //加载所有处理器
        for (chain in config.chain) {
            let processors = config.chain[chain].processors
            this.processors[chain] = {}
            for (var i = 0; i < processors.length; i++) {
                let P = require('./processor/' + processors[i] + '.js');
                let p = new P(this, chain)
                this.processors[chain][p.name()] = p
            }
        }
        console.log(this.processors)
    }
    //匹配处理器
    choose(message) {
        let processors = this.processors[message.chain]
        if (message.processor) { //指定特定处理器,譬如在处理失败的时候，指定node处理器做兜底
            return processors[message.processor]
        }

        for (var p in processors) {
            if (processors[p].contain(message.request)) {
                return processors[p]
            }
        }
        return processors['node'] //node处理器做兜底
    }
    //分发消息
    async router(message) {
        let processor = this.choose(message);
        if (false == await processor.process(message)) {
            if (message.processor !== 'node') {
                message.processor = 'node'
                this.router(message) //重新路由
            } else {
                // notify app break ws connect
                const {id, chain} = message
                this.callback(id, chain, {
                    'cmd': 'close'
                })
            }

        }
    }
    accept(client_id, ws) {
        let chain = ''
        this.clients[client_id] = ws
        this.clients[client_id].removeAllListeners('message')
        this.clients[client_id].on('message', (message) => {
            if (!(message.trim()))
                return

            try {
                //{"id":uid,"chain":''polkadot,"request":{content....}}
                let msg = JSON.parse(message)
                chain = msg.chain
                msg.id += '-' + client_id
                this.router(msg)
            } catch (e) {
                logger.error('message parse error ', message, e)
            }
        })

        this.clients[client_id].on('close', (code, reason) => {
            // api服务断开，删除本地订阅缓存
            // this.router(msg)
            for (let id in this.unsubscription_msg[client_id]) {
                for (let method in this.unsubscription_msg[client_id][id]) {
                    for (let subId of this.unsubscription_msg[client_id][id][method]) {
                        this.router({
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
            }
            delete this.unsubscription_msg[client_id]
            this.clients[client_id].terminate()
            delete this.clients[client_id]
        })
        this.clients[client_id].on('error', (error) => {
            // 有问题
            this.clients[client_id].terminate()
            delete this.clients[client_id]
            logger.error('client ws error ', error)
        })
    }

    // 回传消息到 api service
    callback(id, chain, response) {
        let ids = id.split('-')
        if (this.clients[ids[1]]) {
            if (this.clients[ids[1]].readyState === WebSocket.OPEN) {
                this.clients[ids[1]].send(toJSON({
                    "id": ids[0],
                    "chain": chain,
                    "response": response
                }))
            } else {
                delete this.clients[ids[1]]
            }
        }
        if (response && response.params) {
            if (!this.unsubscription_msg[ids[1]]) {
                this.unsubscription_msg[ids[1]] = {}
            }
            if (!this.unsubscription_msg[ids[1]][id]) {
                this.unsubscription_msg[ids[1]][id] = {}
            }
            if (!this.unsubscription_msg[ids[1]][id][config['un-subscription'][response.method]]) {
                this.unsubscription_msg[ids[1]][id][config['un-subscription'][response.method]] = new Set()
            }
            this.unsubscription_msg[ids[1]][id][config['un-subscription'][response.method]].add(response.params.subscription)
        }
    }
}

module.exports = Router