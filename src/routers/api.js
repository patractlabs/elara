const Result = require('../lib/result')
const rpc = require("../api/rpc")
const Stat = require("../api/stat")
const { logger } = require('../lib/log')

let v1 = async (ctx, next) => {
    let req = ctx.request.body
    let chain='substrate'
    let pid=config.pid
    
    try {
        let start = (new Date()).getTime()
        let res = await rpc.http(chain, req)
        let end = (new Date()).getTime()
        ctx.response.body = res.body
        let ip = (ctx.request.header['x-forwarded-for'] ? ctx.request.header['x-forwarded-for'].split(/\s*,\s/[0]) : null) || ''

        await Stat.stat({
            protocol: ctx.request.protocol,
            header: ctx.request.header,
            ip: ip,
            chain: chain,
            pid: pid,
            method: req.method,
            req: req,
            resp: res.body,
            code: res.statusCode,
            bandwidth: res.header['content-length'],
            start: start,
            end: end
        })
    } catch (e) {
        logger.error('Stat Error', e)
        throw new Result(-1, "RPC Error!")
    }
    return next()
}

module.exports = {
    'POST /': v1
}