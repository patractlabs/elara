const { formateDate, sleep } = require('../../lib/helper/assist');
const config = global.config = require('../config/index')();
const redis = require('../../lib/redis')
const { logger } = require('../../lib/log')
const KEY = require('../src/api/KEY')
const Project = require('../src/api/project')

async function data(date) {
    let data = {}

    let projects = await redis.smembers(KEY.PROJECTS())

    for (var i = 0; i < projects.length; i++) {
        let pid = projects[i]
        let project = await Project.info(pid)
        if (!project.isOk())
            continue

        let chain = project.data.chain
        if (!data[chain])
            data[chain] = {}
        if (!data[chain].total_requests)
            data[chain].total_requests = 0

        if (!data[chain].total_project)
            data[chain].total_project = 1
        else
            data[chain].total_project++

        if (!data[chain].total_bandwidth)
            data[chain].total_bandwidth = 0
        if (!data[chain].total_timeout)
            data[chain].total_timeout = 0
        if (!data[chain].total_delay)
            data[chain].total_delay = 0
        if (!data[chain].total_method)
            data[chain].total_method = {}

        let request = await redis.get(KEY.REQUEST(pid, date))
        data[chain].total_requests += parseInt(request ? request : 0)

        let bandwidth = await redis.get(KEY.BANDWIDTH(pid, date))
        data[chain].total_bandwidth += parseInt(bandwidth ? bandwidth : 0)

        let timeout = await redis.get(KEY.TIMEOUT(pid, date))
        data[chain].total_timeout += parseInt(timeout ? timeout : 0)

        let delay = await redis.get(KEY.DELAY(pid, date))
        data[chain].total_delay += parseInt(delay ? delay : 0)

        let methods = await redis.hgetall(KEY.METHOD(pid, date))
        if (methods) {
            for (var m in methods) {
                if (data[chain].total_method[m])
                    data[chain].total_method[m] += parseInt(methods[m])
                else
                    data[chain].total_method[m] = parseInt(methods[m])
            }
        }
    }

    for (let chain in data) {
        data[chain].total_delay = data[chain].total_delay / (data[chain].total_project ? data[chain].total_project : 1)
        data[chain].total_delay = data[chain].total_delay.toFixed(2)
    }

    return data
}
(async function () {
    try {
        while (true) {
            await sleep(30000)
            let oneday = 24 * 60 * 60 * 1000
            let today = (new Date()).getTime()

            let week = {}
            for (var i = 0; i < 30; i++) {
                let date = formateDate(new Date(today - i * oneday))
                week[date] = await data(date)
            }

            await redis.set(KEY.DASHBOARD(), JSON.stringify(week))
            console.log(JSON.stringify(week))
        }
    } catch (e) {
        logger.error('update dashboard error!', e)
        process.exit(0)
    }

})()
