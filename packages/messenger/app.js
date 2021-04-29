const Koa = require('koa')
const koaBody = require('koa-body')
const { logger, accessLogger } = require('../lib/log')
const Result = require('../lib/result')
global.config = require('./config/index')()
const app = new Koa()
const WebSocketServer = require('ws').Server;
const crypto = require("crypto");
const Router=require('./src/router');


app
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
                data
            }
        })
    })

app.on('error', error => {
    logger.error(error)
})

let router=new Router();
let server = app.listen(config.port)
let wss = new WebSocketServer({ server: server, clientTracking: true });
wss.on('connection', function (ws, request) {
    logger.info('wss connection ', wss.clients.size)
    
    let id = crypto.randomBytes(16).toString('hex');
    router.accept(id, ws)
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


