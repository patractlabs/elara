const crypto = require("crypto");
const { toJSON, fromJSON } = require("../../../lib/helper/assist")
const { isSubscription, isUnSubscription } = require("../../../lib/helper/check")
const Pool = require("../lib/pool")

class KV {
    constructor(router, chain) {
        this.methods = config.chain[chain].processor.subscription
        this.replacement_msg = {}
        this.subscription_msg = {}
        this.router = router
        this.pool = new Pool('kv', chain, async (message) => {
            //console.log('back',chain,message)
            message = fromJSON(message)
            if (message.error) {
                console.log('Error', message)
                return
            }

            if (message.result) {
                message = fromJSON(message.result)
                let replacement_id = message.id
                if (this.replacement_msg[replacement_id]) {
                    message.id = this.replacement_msg[replacement_id].request.id
                    let id = this.replacement_msg[replacement_id].id
                    let chain = this.replacement_msg[replacement_id].chain
                    this.router.callback(id, chain, message)
                    if (message.result && true !== message.result) {
                        this.subscription_msg[message.result] = this.replacement_msg[replacement_id]
                    }
                }
                delete this.replacement_msg[replacement_id]
            }
            else if (message.data) {//推送的数据
                message = fromJSON(message.data)
               
                let subscription_id = message.params.subscription
                if (this.subscription_msg[subscription_id]) {
                    //message.id = this.subscription_msg[subscription_id].request.id
                    let id = this.subscription_msg[subscription_id].id
                    let chain = this.subscription_msg[subscription_id].chain
                    this.router.callback(id, chain, message)
                }
            }
            else {
                console.log('Cant Process', message)
            }

        })
    }
    name() {
        return 'KV'
    }
    //是否能处理该消息
    contain(request) {
        if (this.methods.indexOf(request.method) > -1) {
            return true
        }
        return false
    }
    async process(msg) {
        //console.log(toJSON( msg) )
        let replacement = (Buffer.from(crypto.randomBytes(16))).readUIntLE(0, 4)
        this.replacement_msg[replacement] = msg

        let req = fromJSON(toJSON(msg.request))
        req.id = replacement
        this.pool.sendKV(msg.id, req)

        return true
    }
}
module.exports = KV