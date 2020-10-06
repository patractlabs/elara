const path = require('path')
const log4js = require('koa-log4')

log4js.configure({
    appenders: {
        access: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            filename: path.join('./logs/', 'access.log')
        },
        application: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            filename: path.join('./logs/', 'app.log')
        },
        out: {
            type: 'console'
        }
    },
    categories: {
        default: { appenders: ['out'], level: 'info' },
        access: { appenders: ['access'], level: 'info' },
        application: { appenders: ['application'], level: 'info' },
    }
})

module.exports.accessLogger = () => log4js.koaLogger(log4js.getLogger('access'))
module.exports.logger = log4js.getLogger('application')