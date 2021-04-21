const WebSocket = require('ws')
const { logger } = require('../../lib/log')

const CODE = require('../../lib/helper/code')
const { toJSON } = require("../../lib/helper/assist")

class Router {
    constructor() {
        this.clients = {}
        this.processors = {}
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
        if (message.processor) {//指定特定处理器,譬如在处理失败的时候，指定node处理器做兜底
            return processors[message.processor]
        }

        for (var p in processors) {
            if (processors[p].contain(message.request)) {
                return processors[p]
            }
        }
        return processors['node'] //node处理器做兜底
    }
    callback(id, chain, response) {
        let ids = id.split('-')
        if (this.clients[ids[1]]) {
            this.clients[ids[1]].send(toJSON({
                "id": ids[0],
                "chain": chain,
                "response": response
            }))
        }
    }
    //分发消息
    async router(message) {
        let processor = this.choose(message);
        if (false == await processor.process(message)) {
            message.processor = 'node'
            this.router(message)//重新路由
        }
        //console.log('router',message)
    }
    accept(client_id, ws) {
        this.clients[client_id] = ws
        this.clients[client_id].removeAllListeners('message')
        this.clients[client_id].on('message', (message) => {
            if (!(message.trim()))
                return
            
            try {
                //{"id":uid,"chain":''polkadot,"request":{content....}}
                let msg = JSON.parse(message)
                msg.id += '-' + client_id
                this.router(msg)
            } catch (e) {
                logger.error('message parse error ', message, e)
            }
        })

        this.clients[client_id].on('close', (code, reason) => {
            this.clients[client_id] = null
        })
        this.clients[client_id].on('error', (error) => {
            this.clients[client_id].terminate()
            this.clients[client_id] = null
            logger.error('client ws error ', error)
        })



    }
}

module.exports = Router