const redis = require('../lib/redis')
const Result = require('../lib/result');
const Stat = require('../api/stat');
const { records } = require('../api/stat');
const { checkAuthenticated, checkProject } = require('../helper/check')
const { formateDate } = require('../lib/tool');

let chain = async (ctx, next) => {
    ctx.response.body = (new Result(0, '', await Stat.getChain())).toString()
    return next()
}

let day = async (ctx, next) => {
    let today = formateDate(new Date())

    if( !checkAuthenticated(ctx)){
        return next()
    }
    let uid = ctx.state.user
    let pid = ctx.request.params.pid
    let date = ctx.request.params.date ? parseInt(ctx.request.params.date) : today

    await checkProject(pid, uid)

    ctx.response.body = (new Result(0, '', await Stat.day(pid, date))).toString()
    return next()
}
let week = async (ctx, next) => {
    if( !checkAuthenticated(ctx)){
        return next()
    }
    let uid = ctx.state.user
    let pid = ctx.request.params.pid

    await checkProject(pid, uid)

    ctx.response.body = (new Result(0, '', await Stat.week(pid))).toString()
    return next()
}
let requests = async (ctx, next) => {
    ctx.response.body = (new Result(0, '', await Stat.requests(20))).toString()
    return next()
}

let dashboard=async (ctx, next) => {
    ctx.response.body = (new Result(0, '', await Stat.dashboard())).toString()
    return next()
}

module.exports = {
    'GET /stat/chain': chain, //链总请求数
    'GET /stat/day/:pid([a-z0-9]{32})': day, //项目的今天统计信息
    'GET /stat/week/:pid([a-z0-9]{32})': week, //项目的周统计信息
    'GET /stat/requests': requests, // last request
    'GET /stat/dashboard': dashboard
}

