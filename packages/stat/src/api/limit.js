const Account = require('./account')
const { formateDate } = require('../../../lib/helper/assist');
const redis = require('../../../lib/redis')
const KEY = require('./KEY')
class Limit {
    constructor() {
    }

    //账户的每日限额
    static async create(uid) {
        let account = await Account.info(uid)
        let limit = new Limit()
        limit.daily = global.config.limit.daily[0]
        limit.project = global.config.limit.project[0]

        if (account.isOk()) {
            limit.daily = global.config.limit.daily[account.data.vip]
            limit.project = global.config.limit.project[account.data.vip]
        }
        return limit
    }
    //是否在黑名单
    static async isBlack(uid) {
        return await redis.sismember(KEY.BLACKUID(), uid)
    }
    static async isLimit(uid, pid) {
        let date = formateDate(new Date())
        let limit = await Limit.create(uid)

        let today_request = await redis.get(KEY.REQUEST(pid, date))
        if (today_request > limit.daily) {
            return true
        }
        return false
    }

}

module.exports = Limit