const { logger } = require('../lib/log');
const redis = require('../lib/redis')
const { midnight, now, formateDate } = require('../lib/tool');
const KEY = require('./KEY')

class Stat {
    static async createProject(mail, pid) {
        await redis.sadd(KEY.PROJECT(mail), pid);
        await redis.sadd(KEY.PROJECTS(), pid);
    }
    static async stat(info) {

        let protocol = info.protocol
        let header = info.header
        let chain = info.chain
        let pid = info.pid
        let method = info.method
        let req = info.req
        let resp = info.resp
        let code = info.code
        let bandwidth = info.bandwidth
        let start = info.start
        let end = info.end

        await Stat._request_response(info)
        await Stat._timeout(pid, end - start)
        await Stat._today_request(pid)
        await Stat._method(pid, method)
        await Stat._bandwidth(pid, bandwidth)
        await Stat._code(pid, code)
        await Stat._header(header, pid)
        await Stat._chain(chain)
    }

    static async _request_response(info) {
        await redis.lpush(KEY.REQUEST_RESPONSE(), JSON.stringify(info))
        await redis.ltrim(KEY.REQUEST_RESPONSE(), 0, config.requests)
    }
    static async _timeout(pid, delay) {
        let date = formateDate(new Date())

        if (delay > config.timeout)
            await redis.incr(KEY.TIMEOUT(pid, date))
        let average = await redis.get(KEY.DELAY(pid, date))
        if (average) {
            let requests = await redis.get(KEY.REQUEST(pid, date))
            average = Math.floor((requests * average + delay) / (requests + 1))
            await redis.set(KEY.DELAY(pid, date), average)
        }
        else {
            await redis.set(KEY.DELAY(pid, date), delay)
        }
    }

    static async _today_request(pid) {
        let timestamp = now()
        let date = formateDate(new Date())

        await redis.incr(KEY.REQUEST(pid, date))
        await redis.set(KEY.REQUEST_UPDATETIME(pid, date), timestamp)
    }
    static async _method(pid, method) {
        let date = formateDate(new Date())
        let key_method = KEY.METHOD(pid, date)

        let reply = await redis.hgetall(key_method)
        if (reply && reply[method]) {
            await redis.hset(key_method, method, parseInt(reply[method]) + 1);
        }
        else
            await redis.hset(key_method, method, 1);
    }
    static async _chain(chain) {
        await redis.incr(KEY.TOTAL(chain))
    }
    static async _bandwidth(pid, bandwidth) {
        let date = formateDate(new Date())
        await redis.incrby(KEY.BANDWIDTH(pid, date), bandwidth)
    }
    static async _code(pid, code) {
        let date = formateDate(new Date())
        let key_code = KEY.CODE(pid, date)

        let reply = await redis.hgetall(key_code)
        if (reply && reply[code]) {
            await redis.hset(key_code, code, parseInt(reply[code]) + 1);
        }
        else
            await redis.hset(key_code, code, 1);
    }
    static async _header(header, pid) {
        let agent = header['user-agent'] ? header['user-agent'] : 'null'
        let origin = header['origin'] ? header['origin'] : 'null'

        Stat._agent(pid, agent)
        Stat._origin(pid, origin)
    }
    static async _agent(pid, agent) {
        let date = formateDate(new Date())
        let key_agent = KEY.AGENT(pid, date)

        let reply = await redis.hgetall(key_agent)
        if (reply && reply[agent]) {
            await redis.hset(key_agent, agent, parseInt(reply[agent]) + 1);
        }
        else
            redis.hset(key_agent, agent, 1);
    }
    static async _origin(pid, origin) {
        let date = formateDate(new Date())
        let key_origin = KEY.ORIGIN(pid, date)

        let reply = await redis.hgetall(key_origin)
        if (reply && reply[origin]) {
            await redis.hset(key_origin, origin, parseInt(reply[origin]) + 1);
        }
        else
            await redis.hset(key_origin, origin, 1);
    }

    static async getChain() {
        let total = {}
        for (let chain in config.chain) {
            let count = await redis.get(KEY.TOTAL(chain))
            total[chain] = count ? count : 0
        }
        return total
    }

    static async countByAccount(mail) {
        let count = await redis.scard(KEY.PROJECT(mail))
        return count ? count : 0
    }

    static async day(pid, date) {
        if (!date) {
            date = formateDate(new Date())
        }
        let today = {}

        let pid_request = await redis.get(KEY.REQUEST(pid, date))
        today.request = pid_request ? pid_request : 0

        let request_updatetime = await redis.get(KEY.REQUEST_UPDATETIME(pid, date))
        today.updatetime = request_updatetime ? request_updatetime : 0

        let method = await redis.hgetall(KEY.METHOD(pid, date))
        today.method = method ? method : {}

        let bandwidth = await redis.get(KEY.BANDWIDTH(pid, date))
        today.bandwidth = bandwidth ? bandwidth : 0

        let code = await redis.hgetall(KEY.CODE(pid, date))
        today.code = code ? code : {}

        let agent = await redis.hgetall(KEY.AGENT(pid, date))
        today.agent = agent ? agent : {}

        let origin = await redis.hgetall(KEY.ORIGIN(pid, date))
        today.origin = origin ? origin : {}

        let timeout = await redis.get(KEY.TIMEOUT(pid, date))
        today.timeout = timeout ? timeout : 0

        let delay = await redis.get(KEY.DELAY(pid, date))
        today.delay = delay ? delay : 0

        return today
    }

    static async week(pid) {
        let oneday = 24 * 60 * 60 * 1000
        let today = (new Date()).getTime()

        let week = {}
        for (var i = 0; i < 7; i++) {
            let date = formateDate(new Date(today - i * oneday))
            week[date] = await Stat.day(pid, date)
        }

        return week
    }
    static async requests(size) {
        let requests = []

        try {
            let list = await redis.lrange(KEY.REQUEST_RESPONSE(), 0, size)
            for (var i = 0; i < list.length; i++) {
                requests[i] = JSON.parse(list[i])
            }
        } catch (e) {
            logger.error('request_response Parse Error!', e)
        }
        return requests
    }
    static async dashboard() {
        let dashboard = {}
        try {
            dashboard = JSON.parse(await redis.get(KEY.DASHBOARD()))
        } catch (e) {
            logger.error('Dashboard Parse Error!')
        }
        return dashboard
    }
}

module.exports = Stat