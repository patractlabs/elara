const { formateDate, sleep } = require('../lib/tool');
const config = global.config = require('../../config/index')();
const redis = require('../lib/redis');
const { logger } = require('../lib/log')
const KEY = require('../api/KEY')

async function data(date) {
    let total_requests = 0
    let total_bandwidth = 0
    let total_timeout = 0
    let total_delay = 0
    let total_method = {}

    let projects = await redis.smembers(KEY.PROJECTS())
    if (!projects)
        projects = []
    projects.push(config.pid)

    for (var i = 0; i < projects.length; i++) {
        let pid = projects[i]

        let request = await redis.get(KEY.REQUEST(pid, date))
        total_requests += parseInt(request ? request : 0)

        let bandwidth = await redis.get(KEY.BANDWIDTH(pid, date))
        total_bandwidth += parseInt(bandwidth ? bandwidth : 0)

        let timeout = await redis.get(KEY.TIMEOUT(pid, date))
        total_timeout += parseInt(timeout ? timeout : 0)

        let delay = await redis.get(KEY.DELAY(pid, date))
        total_delay += parseInt(delay ? delay : 0)

        let methods = await redis.hgetall(KEY.METHOD(pid, date))
        if (methods) {
            for (var m in methods) {
                if (total_method[m])
                    total_method[m] += parseInt(methods[m])
                else
                    total_method[m] = parseInt(methods[m])
            }
        }
    }
    total_delay = total_delay / (projects.length ? projects.length : 1)

    return {
        requests: total_requests,
        bandwidth: total_bandwidth,
        timeout: total_timeout,
        delay: total_delay.toFixed(2),
        method: total_method
    }
}
(async function () {
    try {
        while (true) {
            await sleep(10000)
            let oneday = 24 * 60 * 60 * 1000
            let today = (new Date()).getTime()

            let week = {}
            for (var i = 0; i < 7; i++) {
                let date = formateDate(new Date(today - i * oneday))
                week[date] = await await data(date)
            }

            await redis.set(KEY.DASHBOARD(), JSON.stringify(week))
            console.log(JSON.stringify(week))
        }
    } catch (e) {
        logger.error('update dashboard error!')
    }

})()
