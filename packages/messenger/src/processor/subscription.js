const crypto = require("crypto");
const { toJSON, fromJSON } = require("../../../lib/helper/assist")
const { isSubscription, isUnSubscription } = require("../../../lib/helper/check")

class Subscription {
    constructor(router, chain) {
        this.replacement_msg = {}
        this.subscription_msg = {}
        this.router = router
    }
    name() {
        return 'subscription'
    }
    //是否能处理该消息
    contain(req) {
        return false
    }
    async process(msg) {
       
        return false
    }
}
module.exports = Subscription