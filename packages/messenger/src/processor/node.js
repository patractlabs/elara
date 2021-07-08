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
                        const {
                            id,
                            chain
                        } = this.subscription_msg[subscription_id]
                        this.router.callback(id, chain, message)
                    }
                } else if (message.id) { //常规消息
                    let replacement_id = message.id.toString()
                    if (this.replacement_msg[replacement_id]) {
                        let {
                            id,
                            method,
                            originId
                        } = this.replacement_msg[replacement_id]
                        message.id = originId
                        this.router.callback(id, chain, message)
                        if (message.result && isSubscription(method)) {
                            this.replacement_msg[replacement_id]['subscription_msg'] = message.result
                            this.subscription_msg[message.result] = this.replacement_msg[replacement_id]
                        }
                    }
                    delete this.replacement_msg[replacement_id]
                }

            },
            (closeClientIDs) => {
                if (closeClientIDs.size === 0) return
                //节点的链路断了,通知客户端关闭重连
                closeClientIDs.forEach((id) => {
                    this.router.callback(id, this.chain, {
                        'cmd': 'close'
                    })
                    logger.info('Close Client', this.chain, id)
                })
            })

        setInterval(() => {
            console.log(`${this.chain}: replacement_msg: ${Object.keys(this.replacement_msg).length};  subscription_msg: ${Object.keys(this.subscription_msg).length}`)
        }, 60000)
    }
    name() {
        return 'node'
    }
    //是否能处理该消息
    contain(req) {
        return false
    }
    async process(msg) {
        let replacement = (Buffer.from(crypto.randomBytes(16))).readUIntLE(0, 4)
        this.replacement_msg[replacement.toString()] = {id: msg.id, originId: msg.request.id, method: msg.request.method}

        let req = fromJSON(toJSON(msg.request))
        req.id = replacement
        //这里处理下取消订阅时更新 this.subscription_msg
        if (isUnSubscription(req.method) && (req.params)) {
            for (var i = 0; i < req.params.length; i++) {
                delete this.subscription_msg[req.params[i]]
            }
        }

        const res =  this.pool.send(msg.id, req)
        setTimeout(()=>{
            if(this.replacement_msg[replacement.toString()]) {
                delete this.replacement_msg[replacement.toString()]
                console.log('replacement error');
            }
        },20000)
        return res
    }
}
module.exports = Node