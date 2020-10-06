const SocketPair = require("../api/ws")
const { logger } = require('../lib/log')

let accept = async function (ws, request) {
    let chain='substrate'
    let pid=config.pid
    try {
        let pair = new SocketPair(ws, chain, pid, request)
    } catch (e) {
        ws.terminate()
        logger.error("Socket Error", e)
    }
}

module.exports = {
    accept
} 