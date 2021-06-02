const {
    logger
} = require('../../../lib/log');
const redis = require('../../../lib/redis')
const {
    now,
    formateDate
} = require('../../../lib/helper/assist');
const KEY = require('./KEY')
const Project = require('./project')
/**
 *  统计
 */
class Stat {
    static async createProject(uid, pid) {
        await redis.sadd(KEY.PROJECT(uid), pid);
        await redis.sadd(KEY.PROJECTS(), pid);
    }
    static async request(info) {

        let protocol = info.protocol
        let header = info.header /*请求头 */
        let chain = info.chain
        let pid = info.pid
        let method = info.method
        let req = info.req /*请求体 */
        let resp = info.resp /*响应体 */
        let code = info.code
        let bandwidth = info.bandwidth /*响应带宽*/
        let start = parseInt(info.start)
        let end = parseInt(info.end)
        let delay = ((end - start) > config.timeout) ? config.timeout : (end - start)

        await Stat._request_response(info) //最新1000个请求记录
        await Stat._timeout(pid, parseInt(delay)) //
        await Stat._today_request(pid) //今日请求数统计
        await Stat._method(pid, method) //每日调用方法分类统计
        await Stat._bandwidth(pid, bandwidth) //每日带宽统计
        await Stat._code(pid, code) //每日调用响应码分类统计
        await Stat._header(header, pid) //请求头分析统计
        await Stat._chain(chain) //链的总请求数统计
        await Stat._requestByDay(chain)

        logger.info('pid=', pid, ',protocol=', protocol, ',chain=', chain, ',method=', method, ',code=', code, ',bandwidth=', bandwidth, ',delay=', delay)
    }

    static async _request_response(info) {
        await redis.lpush(KEY.REQUEST_RESPONSE(), JSON.stringify(info))
        await redis.ltrim(KEY.REQUEST_RESPONSE(), 0, config.requests)
    }
    static async _timeout(pid, delay) {
        let date = formateDate(new Date())

        if (delay >= config.timeout)
            await redis.incr(KEY.TIMEOUT(pid, date))
        let average = parseInt(await redis.get(KEY.DELAY(pid, date)))
        if (average) { //算平均
            let requests = parseInt(await redis.get(KEY.REQUEST(pid, date)))
            average = ((requests * average + delay) / (requests + 1)).toFixed(2)
            await redis.set(KEY.DELAY(pid, date), average)
        } else {
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
        await redis.hincrby(key_method, method, 1);
    }
    static async _chain(chain) {
        await redis.incr(KEY.TOTAL(chain))
    }

    static async _requestByDay() {
        let date = formateDate(new Date())
        await redis.incr(KEY.REQUEST_DAILY(date))
    }

    static async _bandwidth(pid, bandwidth) {
        let date = formateDate(new Date())
        await redis.incrby(KEY.BANDWIDTH(pid, date), parseInt(bandwidth))
    }
    static async _code(pid, code) {
        let date = formateDate(new Date())
        let key_code = KEY.CODE(pid, date)
        await redis.hincrby(key_code, code, 1);
    }
    static async _header(header, pid) {
        let agent = header['user-agent'] ? header['user-agent'] : 'null'
        let origin = header['origin'] ? header['origin'] : 'null'
        // let ip = (header['x-forwarded-for'] ? header['x-forwarded-for'].split(/\s*,\s/[0]) : null)  || ''

        Stat._agent(pid, agent)
        Stat._origin(pid, origin)
    }
    static async _agent(pid, agent) {
        let date = formateDate(new Date())
        let key_agent = KEY.AGENT(pid, date)
        await redis.hincrby(key_agent, agent, 1)
    }
    static async _origin(pid, origin) {
        let date = formateDate(new Date())
        let key_origin = KEY.ORIGIN(pid, date)
        await redis.hincrby(key_origin, origin, 1)
    }

    //链的总请求数
    static async getChain() {
        let total = {}
        for (let chain in config.chain) {
            let count = await redis.get(KEY.TOTAL(chain))
            total[chain] = count ? count : "0"
        }
        return total
    }

    // 过去n天，当天所有链请求总数
    static async getTotalRequestByRange(days) {
        let oneday = 24 * 60 * 60 * 1000
        let today = (new Date()).getTime()

        let data = {}
        for (var i = 0; i < parseInt(days); i++) {
            let date = formateDate(new Date(today - i * oneday))
            data[date] = await redis.get(KEY.REQUEST_DAILY(date)) || "0"
        }

        return data
    }

    //账户下的项目总数
    static async countByAccount(uid) {
        let count = await redis.scard(KEY.PROJECT(uid))
        return count ? count : 0
    }

    //项目的某日统计信息
    static async day(pid, date) {
        if (!date) {
            date = formateDate(new Date())
        }
        let today = {}

        let pid_request = await redis.get(KEY.REQUEST(pid, date))
        today.request = pid_request ? pid_request : '0'

        let request_updatetime = await redis.get(KEY.REQUEST_UPDATETIME(pid, date))
        today.updatetime = request_updatetime ? request_updatetime : '0'

        let method = await redis.hgetall(KEY.METHOD(pid, date))
        today.method = method ? method : {}

        let bandwidth = await redis.get(KEY.BANDWIDTH(pid, date))
        today.bandwidth = bandwidth ? bandwidth : '0'

        let code = await redis.hgetall(KEY.CODE(pid, date))
        today.code = code ? code : {}

        let agent = await redis.hgetall(KEY.AGENT(pid, date))
        today.agent = agent ? agent : {}

        let origin = await redis.hgetall(KEY.ORIGIN(pid, date))
        today.origin = origin ? origin : {}

        let timeout = await redis.get(KEY.TIMEOUT(pid, date))
        today.timeout = timeout ? timeout : 0

        let delay = await redis.get(KEY.DELAY(pid, date))
        today.delay = delay ? delay : '0'

        return today
    }
    //项目的周统计信息
    static async days(pid, days) {
        let oneday = 24 * 60 * 60 * 1000
        let today = (new Date()).getTime()

        let data = {}
        for (var i = 0; i < parseInt(days); i++) {
            let date = formateDate(new Date(today - i * oneday))
            data[date] = await Stat.day(pid, date)
        }

        return data
    }
    static async requests(size) {
        let requests = []

        try {
            let list = await redis.lrange(KEY.REQUEST_RESPONSE(), 0, size)
            for (var i = 0; i < list.length; i++) {
                requests[i] = JSON.parse(list[i])
                requests[i].pid = requests[i].pid.replace(/(.){16}$/, '******')
                if (requests[i].ip && Array.isArray(requests[i].ip) && requests[i].ip.length) {
                    for (var j = 0; j < requests[i].ip.length; j++) {
                        requests[i].ip[j] = requests[i].ip[j].replace(/^(\d*)\.(\d*)/, '***.***')
                    }
                } else if (requests[i].ip) {
                    requests[i].ip = requests[i].ip.replace(/^(\d*)\.(\d*)/, '***.***')
                }
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