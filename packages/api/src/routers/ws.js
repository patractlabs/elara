const url = require('url')
const {
    logger
} = require('../../../lib/log')
const superagent = require('superagent')

let accept = async function (id) {
    let reg = /^\/([a-zA-Z]{0,20})\/([a-z0-9]{32})$/
    console.log(global.conWs[id].request.url);
    let path = url.parse(global.conWs[id].request.url).path
    if (reg.test(path)) {
        let chain_pid = reg.exec(path)
        let chain = chain_pid[1].toLowerCase()
        let pid = chain_pid[2]
        let check = null
        try {
            check = await superagent.get(config.statServer + '/limit/' + chain + '/' + pid).query({})
        } catch (error) {
            global.conWs[id].ws.terminate()
            delete global.conWs[id]
            logger.error("stat server error", '/limit')
        }

        if (0 != check.body.code) {
            global.conWs[id].ws.send(JSON.stringify(check.body))
            global.conWs[id].ws.terminate()
            delete global.conWs[id]
            logger.error(chain, pid, check.body)
            return
        }
        try {
            global.messengers.wsClient(id, chain, pid)
        } catch (e) {
            global.conWs[id].ws.terminate()
            delete global.conWs[id]
            logger.error("Socket Error", e)
        }
    } else {
        global.conWs[id].ws.terminate()
        delete global.conWs[id]
        logger.error("Path Error", path)
    }
}
module.exports = {
    accept
}