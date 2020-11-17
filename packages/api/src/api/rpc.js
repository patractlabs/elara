const Result = require('../lib/result')
const superagent = require('superagent')

let http = async function (chain, req) {
    let index=Math.floor(Math.random()*config.chain[chain].rpc.length)
    let res = await superagent.post(config.chain[chain].rpc[index]).set('Content-Type', 'application/json').send(req)
    return res
}

module.exports = {
    http
} 