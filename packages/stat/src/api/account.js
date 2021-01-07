const redis = require('../../../lib/redis')
const Result = require('../../../lib/result')
const KEY = require('./KEY')

class Account {
    constructor(uid, vip, cratetime, ext) {
        this.uid = uid
        this.vip = vip
        this.cratetime = cratetime
        this.ext = ext
    }
    //账户下的项目总数
    static async projects(uid) {
        let count = await redis.scard(KEY.PROJECT(uid))
        return count ? count : 0
    }

    static async info(uid) {
        let reply = await redis.hgetall(KEY.UID(uid))
        let projects = await Account.projects(uid)

        let account = null
        if (reply && reply.uid) {
            account = new Account(reply.uid, reply.vip, reply.cratetime, { 'projects': projects })
        }

        return Result.WrapResult(account)
    };
}

module.exports = Account