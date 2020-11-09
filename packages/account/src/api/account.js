const redis = require('../lib/redis')
const Result = require('../lib/result')
const { now } = require('../lib/tool');
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

    //创建新账户
    static async create(uid, vip) {
        const timestamp = now()
        let cratetime = timestamp;

        redis.hset(KEY.UID(uid), 'uid', uid);
        redis.hset(KEY.UID(uid), 'vip', vip);
        redis.hset(KEY.UID(uid), 'cratetime', cratetime);

        return await Account.info(uid)
    }
}

module.exports = Account