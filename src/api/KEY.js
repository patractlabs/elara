
module.exports = {
    PROJECT: (uid) => 'project_' + uid,
    PROJECTS: () => 'projects',
    REQUEST_RESPONSE: () => 'request_response',
    TIMEOUT: (pid, date) => pid + '_timeout_' + date,
    DELAY: (pid, date) => pid + '_delay_' + date,
    REQUEST: (pid, date) => pid + '_request_' + date,
    REQUEST_UPDATETIME: (pid, date) => pid + '_request_updatetime_' + date,
    METHOD: (pid, date) => pid + '_method_' + date,
    TOTAL: (chain) => chain + '_total',
    BANDWIDTH: (pid, date) => pid + '_bandwidth_' + date,
    CODE: (pid, date) => pid + '_code_' + date,
    AGENT: (pid, date) => pid + '_agent_' + date,
    ORIGIN: (pid, date) => pid + '_origin_' + date,
    DASHBOARD: () => 'dashboard'

}