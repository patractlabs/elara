const url = require('url')
const {
    logger
} = require('../../../lib/log')
const superagent = require('superagent')

let accept = async function (id, ws, request) {
    let reg = /^\/([a-zA-Z]{0,20})\/([a-z0-9]{32})$/
    let path = url.parse(request.url).path
    if (reg.test(path)) {
        let chain_pid = reg.exec(path)
        let chain = chain_pid[1].toLowerCase()
        let pid = chain_pid[2]
        let check = null
        try {
            check = await superagent.get(config.statServer + '/limit/' + chain + '/' + pid).query({})
        } catch (error) {
            ws.terminate()
            logger.error("stat server error", '/limit')
            return
        }

        if (0 != check.body.code) {
            ws.send(JSON.stringify(check.body))
            ws.terminate()
            logger.error(chain, pid, check.body)
            return
        }
        try {
            global.messengers.wsClient(id, ws, request, chain, pid)
        } catch (e) {
            ws.terminate()
            logger.error("Socket Error", e)
        }
    } else {
        ws.terminate()
        logger.error("Path Error", path)
    }
}
module.exports = {
    accept
}