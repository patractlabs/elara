const Result = require('../../../lib/result')
const superagent = require('superagent')
const CODE = require('../../../lib/helper/code')

let http = async function (chain, req) {
    try {
        let index = Math.floor(Math.random() * config.chain[chain].rpc.length)
        let res = await superagent.post(config.chain[chain].rpc[index]).set('Content-Type', 'application/json').send(req)
        return res
    } catch (e) {
        logger.error('Rpc Error', e)
        throw CODE.RPC_ERROR
    }
}

module.exports = {
    http
}