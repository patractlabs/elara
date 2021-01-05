const WebSocket = require('ws')
const crypto = require("crypto");
const { toJSON, fromJSON } = require("../../../lib/helper/assist")
const { isSubscription } = require("../../../lib/helper/check")
const Pool=require("../lib/pool")
class Node {
    constructor(router, chain) {
        this.replacement_msg = {}
        this.subscription_msg = {}
        this.router = router
        this.pool=new Pool(chain,async (message) => {
            console.log('back',chain,message)
            message = fromJSON(message)
            if (message.params && message.params.subscription) {//订阅消息
                let subscription_id = message.params.subscription
                if (this.subscription_msg[subscription_id]) {
                    message.id = this.subscription_msg[subscription_id].request.id
                    let id = this.subscription_msg[subscription_id].id
                    let chain = this.subscription_msg[subscription_id].chain
                    this.router.callback(id, chain, message)
                }
            }
            else if (message.id) {//常规消息
                let replacement_id = message.id
                if (this.replacement_msg[replacement_id]) {
                    message.id = this.replacement_msg[replacement_id].request.id
                    let id = this.replacement_msg[replacement_id].id
                    let chain = this.replacement_msg[replacement_id].chain
                    this.router.callback(id, chain, message)
                    if (message.result && isSubscription(chain, this.replacement_msg[replacement_id].request)) {
                        this.subscription_msg[message.result] = this.replacement_msg[replacement_id]
                    }
                }
                delete this.replacement_msg[replacement_id]
            }
    
        })
}
name() {
    return 'node'
}
//是否能处理该消息
contain(req) {
    return false
}
process(msg) {
    let replacement = (Buffer.from(crypto.randomBytes(16))).readUIntLE(0, 4)
    this.replacement_msg[replacement] = msg

    let req = fromJSON(toJSON(msg.request))
    req.id = replacement
    this.pool.send(req)

    return true
}
}
module.exports = Node