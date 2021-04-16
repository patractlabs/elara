const { toJSON, fromJSON } = require('../../../lib/helper/assist')
const superagent = require('superagent')
const crypto = require('crypto')
const { logger } = require('../../../lib/log')

class Cache {
    constructor(router, chain) {
        this.router = router
        this.chain = chain
        this.cache = {}

        this.methods = config.chain[chain].processor.cache
        this.rpcs = []
        this.methods_key = [] //  hash list
        this.buildRpc()

        // 异步调用 Q&A
        setInterval(async () => {
            await this.writeCache()
        }, 5000)
    }

    // init rpcs & methods_keys
    buildRpc() {
        for (var i = 0; i < this.methods.length; i++) {
            let request = {
                id: 1,
                jsonrpc: '2.0',
                method: this.methods[i],
                params: [],
            }
            this.rpcs.push(request)
            this.methods_key.push(this.key(this.methods[i], []))
        }
        //特殊 Q&A?
        this.rpcs.push({
            id: 1,
            jsonrpc: '2.0',
            method: 'chain_getBlockHash',
            params: [0],
        })
        this.methods_key.push(this.key('chain_getBlockHash', [0]))
    }

    key(method, params) {
        return this.hash(method + '_' + toJSON(params))
    }

    hash(m) {
        const hash = crypto.createHash('md5')
        hash.update(m)
        return hash.digest('hex')
    }

    async writeCache() {
        for (let i in this.rpcs) {
            try {
                let rpc = config.chain[this.chain].rpc[0]
                let res = await superagent
                    .post(rpc)
                    .set('Content-Type', 'application/json')
                    .send(toJSON(this.rpcs[i]))
                if (200 == res.statusCode) {
                    this.cache[
                        this.key(this.rpcs[i].method, this.rpcs[i].params)
                    ] = res.body
                    // console.log('res: ', res.body)
                    //console.log('set cache',this.rpcs[i].method,this.key(this.rpcs[i].method, this.rpcs[i].params))
                }
            } catch (e) {
                logger.error('cache Rpc Error', e)
            }
        }
    }

    name() {
        return 'cache'
    }
    //是否能处理该消息
    contain(request) {
        if (
            this.methods_key.indexOf(this.key(request.method, request.params)) >
            -1
        ) {
            return true
        }
        return false
    }

    async process(message) {
        //console.log('find cache',message.request.method,this.key(message.request.method, message.request.params))
        let resp = this.cache[
            this.key(message.request.method, message.request.params)
        ]
        if (resp) {
            //console.log('get cache',message.request.method,this.key(message.request.method, message.request.params))
            let data = fromJSON(toJSON(resp))
            data.id = message.request.id
            this.router.callback(message.id, this.chain, data)
            return true
        }

        return false
    }
}
module.exports = Cache
