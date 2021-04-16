const Koa = require('koa')
const koaBody = require('koa-body')
const session = require('koa-session2')
const router = require('./router')
const { logger, accessLogger } = require('../lib/log')
const Result = require('../lib/result')
const config = (global.config = require('./config/index')())
let passport = require('./src/lib/passport')
const path = require('path')
const static = require('koa-static')
const app = new Koa()
const RedisStore = require('./src/lib/store')

let sessionConfig = config.session
sessionConfig.store = new RedisStore()
global.message = {}

app.keys = config.keys
app.use(async (ctx, next) => {
    if ('/dashboard' == ctx.path) ctx.path = '/dashboard.html'
    return next()
})
    .use(static(path.join(__dirname, './static/html')))
    .use(session(sessionConfig))
    .use(koaBody({ multipart: true }))
    .use(accessLogger())
    .use(passport.initialize())
    .use(passport.session())
    .use(async (ctx, next) => {
        const start = ctx[Symbol.for('request-received.startTime')]
            ? ctx[Symbol.for('request-received.startTime')].getTime()
            : Date.now()
        await next()
        logger.info(
            ctx.method,
            ctx.originalUrl,
            ctx.request.body,
            ctx.response.status || 404,
            ctx.response.length,
            'byte',
            Date.now() - start,
            'ms'
        )
    })
    .use(async (ctx, next) => {
        return next().catch((error) => {
            let code = 500
            let message = 'unknown error'
            let data = ''
            logger.error(error)
            if (error instanceof Result) {
                code = error.code
                message = error.message
            }
            ctx.body = {
                code,
                message,
                data,
            }
        })
    })
    .use((ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*')
        ctx.set('Content-Type', 'application/json')
        ctx.set('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin')
        ctx.set(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        )
        ctx.set(
            'Access-Control-Allow-Methods',
            'PUT, POST, GET, DELETE, PATCH, OPTIONS'
        )
        ctx.set('Access-Control-Allow-Credentials', true)
        return next()
    })
    .use(router())

app.on('error', (error) => {
    logger.error(error)
})
let server = app.listen(config.port)

process.on('unhandledRejection', (reason, p) => {
    logger.error('Unhandled Rejection at:', p, 'reason:', reason)
})
process.on('uncaughtException', function (e) {
    logger.error('uncaughtException', e)
})
logger.info(config.name, ' started listen on ', config.port)
