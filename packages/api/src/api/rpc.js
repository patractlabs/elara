const Result = require('../lib/result')
const superagent = require('superagent')

let http = async function (chain, req) {
    let res = await superagent.post(config.chain[chain].rpc[0]).set('Content-Type', 'application/json').send(req)
    return res
}

module.exports = {
    http
} 