const crypto = require("crypto");
const {
    toJSON,
    fromJSON
} = require("../../../lib/helper/assist")
const {
    isUnSubscription
} = require("../../../lib/helper/check")
const {
    logger
} = require("../../../lib/log")
const Pool = require("../lib/pool")

class KV {
    constructor(router, chain) {
        this.methods = config.chain[chain].processor.subscription
        this.replacement_msg = {}
        this.subscription_msg = {}
        this.router = router
        this.pool = new Pool(
            'kv',
            chain,
            (message) => {
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
                        const {
                            id,
                            request
                        } = this.replacement_msg[replacement_id]
                        message.id = request.id
                        this.router.callback(id, message)
                        if (message.result && true !== message.result) {
                            this.subscription_msg[message.result] = this.replacement_msg[replacement_id]
                        }
                    }
                    delete this.replacement_msg[replacement_id]
                } else if (message.data) { //推送的数据
                    message = fromJSON(message.data)
                    let subscription_id = message.params.subscription
                    if (this.subscription_msg[subscription_id]) {
                        //message.id = this.subscription_msg[subscription_id].request.id
                        let { id } = this.subscription_msg[subscription_id]
                        this.router.callback(id, message)
                    }
                } else {
                    console.log('Cant Process', message)
                }

            },
            (closeClientIDs) => {
                if (closeClientIDs.size === 0) return
                //节点的链路断了,通知客户端关闭重连
                closeClientIDs.forEach((id) => {
                    //特定命令协议 该协议会回传消息取消订阅
                    this.router.callback(id, {
                        'cmd': 'close'
                    })
                    logger.info('Close Client', chain, id)
                })
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
        if (isUnSubscription(req.method) && req.params) {
            for (var i = 0; i < req.params.length; i++) {
                delete this.subscription_msg[req.params[i]];
            }
        }

        const res = this.pool.sendKV(msg.id, req)

        if (!res) delete this.replacement_msg[replacement];
        return res
    }
}
module.exports = KV