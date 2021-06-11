const crypto = require("crypto");
const {
    toJSON,
    fromJSON
} = require("../../../lib/helper/assist")
const {
    isSubscription,
    isUnSubscription
} = require("../../../lib/helper/check")
const Pool = require("../lib/pool")
const {
    logger
} = require('../../../lib/log')

class Node {
    constructor(router, chain) {
        this.replacement_msg = {}
        this.subscription_msg = {}
        this.clientsSubscriptionMap = {}
        this.chain = chain
        this.router = router
        this.pool = new Pool(
            'chain',
            chain,
            (message) => {
                //console.log('back',chain,message)
                message = fromJSON(message)
                if (message.params && message.params.subscription) { //订阅消息
                    let subscription_id = message.params.subscription
                    if (this.subscription_msg[subscription_id]) {
                        const id  = this.subscription_msg[subscription_id]
                        this.router.callback(id, message)
                    }
                } else if (message.id) { //常规消息
                    let replacement_id = message.id
                    if (this.replacement_msg[replacement_id]) {
                        let { id, originId, method } = this.replacement_msg[replacement_id]
                        message.id = originId
                        this.router.callback(id, message)
                        if (isSubscription(method) && message.result) {
                            this.subscription_msg[message.result] = id
                            // 这里的赋值与clietID绑定，心跳检测client是否保活，失活就删除clietID对应内存
                            if(!this.clientsSubscriptionMap[id]) {
                                this.clientsSubscriptionMap[id] = new Set()
                            }
                            this.clientsSubscriptionMap[id].add(message.result)
                        }
                    }
                    delete this.replacement_msg[replacement_id]
                }

            },
            (closeClientIDs) => {
                if (closeClientIDs.size === 0) return
                //节点的链路断了,通知客户端关闭重连
                closeClientIDs.forEach((id) => {
                    this.router.callback(id, {
                        'cmd': 'close'
                    })
                    logger.info('Close Client', chain, id)
                })
            })
    }
    name() {
        return 'node'
    }
    //是否能处理该消息
    contain(req) {
        return false
    }
    async process(msg) {
        // gc，回收由于用户断开的缓存
        if(msg.request.gc) {
            const startTime = new Date().getTime()
            for(let id in this.clientsSubscriptionMap) {
                if(id === msg.id) {
                    for(let subID of this.clientsSubscriptionMap[id]) {
                        delete this.subscription_msg[subID]
                    }
                    delete this.clientsSubscriptionMap[id]
                }
            }
            console.log(`gc Time: ${(new Date().getTime() - startTime)}; chain: ${this.chain};  replacement_msg: ${Object.keys(this.replacement_msg).length};  subscription_msg: ${Object.keys(this.subscription_msg).length}; clientsSubscriptionMap: ${Object.keys(this.clientsSubscriptionMap).length}`)
            return true
        }

        let replacement = (Buffer.from(crypto.randomBytes(16))).readUIntLE(0, 4)
        const { id, request } = msg
        const replacement_id = `${id}-${replacement}`
        this.replacement_msg[replacement_id] = {id, originId: request.id, method: request.method}

        let req = fromJSON(toJSON(msg.request))
        req.id = replacement_id

        const res =  this.pool.send(id, req)
        if(!res) delete this.replacement_msg[replacement_id]
        return res
    }
}
module.exports = Node
