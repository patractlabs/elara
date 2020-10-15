const Koa = require('koa')
const koaBody = require('koa-body')
const session = require("koa-session2");
const router = require('./router')
const { logger, accessLogger } = require('./src/lib/log')
const Result = require('./src/lib/result')
const config = global.config = require('./config/index')()
const path = require('path')
const static = require('koa-static')
const app = new Koa()
const WebSocketServer = require('ws').Server;
const { accept } = require('./src/routers/ws')
const RedisStore = require('./src/lib/store')
const crypto = require("crypto");

global.message = {}

app.keys = config.keys
app
    .use(async (ctx, next) => {
        if( '/' == ctx.path){
            ctx.body='coming soon...'
        }
        else if ('/demo' == ctx.path)
            ctx.path = '/dashboard.html'
        return next()
    })
    .use(static(path.join(__dirname, './static/html')))
    .use(session({
        key: 'sid',
        maxAge: 86400000,
        store: new RedisStore()
    }))
    .use(koaBody({ multipart: true }))
    .use(accessLogger())
    .use(async (ctx, next) => {
        const start = ctx[Symbol.for('request-received.startTime')] ? ctx[Symbol.for('request-received.startTime')].getTime() : Date.now()
        await next()
        logger.info(ctx.method, ctx.originalUrl, ctx.request.body, ctx.response.status || 404, ctx.response.length, 'byte', (Date.now() - start), 'ms')
    })
    .use(async (ctx, next) => {
        return next().catch((error) => {
            let code = 500
            let msg = 'unknown error'
            logger.error(error)
            if (error instanceof Result) {
                code = error.code
                msg = error.message
            }
            ctx.body = {
                code,
                msg
            }
        })
    })
    .use((ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*')
        ctx.set('Content-Type', 'application/json')
        ctx.set('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin')
        ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
        ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH, OPTIONS')
        ctx.set('Access-Control-Allow-Credentials', true)
        return next()
    })
    .use(router())

app.on('error', error => {
    logger.error(error)
})
let server = app.listen(config.port)
let wss = new WebSocketServer({ server: server, clientTracking: true });
wss.on('connection', function (ws, request) {
    logger.info('wss connection ', wss.clients.size)
    let id = crypto.randomBytes(16).toString('hex');
    global.message[id] = []
    ws.on('message', function (m) {
        global.message[id].push(m) 
    })

    accept(id,ws, request)
})

wss.on('error', (error) => {
    logger.error('wss error', error)
})

wss.on('close', () => {
    logger.info('wss close')
})

process.on('unhandledRejection', (reason, p) => {
    logger.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', function (e) {
    logger.error('uncaughtException', e)
})
logger.info(config.name, ' started listen on ', config.port)


