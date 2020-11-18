const Result = require('../lib/result')
const rpc = require("../api/rpc")
const kafka = require("../api/kafka")
const { logger } = require('../lib/log')
const superagent = require('superagent')

let api = async (ctx, next) => {
    let chain = ctx.request.params.chain
    let pid = ctx.request.params.pid
    let req = ctx.request.body

    let check = await superagent.get(config.statServer + '/limit/' + chain + '/' + pid).query({})
    if (0 == check.body.code) {
        try {
            let start = (new Date()).getTime()
            let res = await rpc.http(chain, req)
            let end = (new Date()).getTime()
            ctx.response.body = res.body

            let ip = (ctx.request.header['x-forwarded-for'] ? ctx.request.header['x-forwarded-for'].split(/\s*,\s/[0]) : null) || ''

            kafka.stat({
                'key': 'request', 
                'message': {
                    protocol: ctx.request.protocol,
                    header: ctx.request.header,
                    ip: ip,
                    chain: chain,
                    pid: pid,
                    method: req.method,
                    req: req,
                    resp: '',//暂时用不上，省空间　res.body,
                    code: res.statusCode,
                    bandwidth: res.header['content-length'],
                    start: start,
                    end: end
                }
            })

            return next()

        } catch (e) {
            logger.error('Stat Error', e)
            ctx.response.body = JSON.stringify(new Result(-7, "RPC Error!"))
        }
    }
    else {
        logger.error(chain, pid, check.body)
        ctx.response.body = check.body
    }
    return next()

}

module.exports = {
    'POST /:chain/:pid([a-z0-9]{32})': api
}