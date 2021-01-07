const Project = require('../api/project')
const CODE = require('./code')

function checkAuthenticated(ctx) {
    if (global.config.test) {
        ctx.state.user = 'Only For Test'
        return true
    }
    if (!ctx.isAuthenticated()) {
        ctx.response.body = (CODE.CHECK_AUTHENTIUCATED_FAIL).toString()
        return false
    }
    return true
}

/**
 * 检查是否有权限查看项目
 * @param {*} ctx 
 * @param {*} pid 
 * @param {*} uid 
 */
async function checkProject(pid, uid) {
    let project = await Project.info(pid)
    if (!project.isOk()) {
        throw CODE.PROJECT_ERROR
    }
    project = project.data
    if (uid != project.uid) {
        throw CODE.NO_ACCESS_ALLOWED
    }

    return project
}

module.exports = {
    checkAuthenticated,
    checkProject
}