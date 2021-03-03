const Project = require('../api/project')
const Limit = require('../api/limit')
const CODE = require('../helper/code')

let checkLimit = async (ctx, next) => {
    let chain = ctx.request.params.chain
    let pid = ctx.request.params.pid
    if ('00000000000000000000000000000000' == pid) {//不需要check
        ctx.response.body = JSON.stringify(CODE.SUCCESS)
        return next()
    }

    //检测项目id是否存在
    let project = await Project.info(pid)
    if (project.isOk()) {
        project = project.data
        //检测链是否匹配
        if (chain.toLowerCase() != project.chain.toLowerCase()) {
            throw CODE.CHAIN_ERROR
        }
        //检测是否运行中
        if (!project.isActive()) {
            throw CODE.PROJECT_NOT_ACTIVE
        }
        let isBlack = await Limit.isBlack(project.uid)
        if (isBlack) {
            throw CODE.BLACK_UID
        }
        let isLimit = await Limit.isLimit(project.uid, pid)
        //检测是否限流
        if (isLimit) {
            throw CODE.OUT_OF_LIMIT
        }

    } else
        throw CODE.PROJECT_ERROR

    ctx.response.body = JSON.stringify(CODE.SUCCESS)

    return next()
}

module.exports = {
    'GET /limit/:chain/:pid([a-z0-9]{32})': checkLimit
}

