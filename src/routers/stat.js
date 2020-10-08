const Result = require('../lib/result');
const Stat = require('../api/stat');

let requests = async (ctx, next) => {
    ctx.response.body = (new Result(0, '', await Stat.requests(20))).toString()
    return next()
}

let dashboard = async (ctx, next) => {
    ctx.response.body = (new Result(0, '', await Stat.dashboard())).toString()
    return next()
}

module.exports = {
    'GET /stat/requests': requests, // last request
    'GET /stat/dashboard': dashboard
}

