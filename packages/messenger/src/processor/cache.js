const { toJSON, fromJSON } = require('../../../lib/helper/assist')
const redis = require('../../../lib/redis')
const superagent = require('superagent')
class Cache {
    constructor(router, chain) {
        this.router = router
        this .chain=chain
        
        this.methods = config.chain[chain].processor.cache
        //加载对应配置
        this.writeCache()
        setInterval(async function(){
           await  this.writeCache()
        },5000);
    }
    key(method){
        return this.name()+'_'+this.chain+'_'+method
    }
    async writeCache(){
        for (let m in this.methods ){
            try {
                let rpc=config.chain[this.chain].rpc[0]
                let res = await superagent.post(rpc).set('Content-Type', 'application/json').send(toJSON({
                    "id":5,"jsonrpc":"2.0","method":this.methods[m],"params":[]
                }))
                if( 200 == res.statusCode ){
                    await redis.set(this.key(this.methods[m]),toJSON(res.body))
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
        if ((this.methods.indexOf(request.method) > -1) && (request.params.length < 1)) {
            return true
        }
        return false
    }
    process(message) {
        redis.get(this.key(message.request.method),async  (error,data)=>{
            data=fromJSON( data)
            data.id=message.request.id
            this.router.callback(message.id, this.chain, data)
        })
        
        return true
    }
}
module.exports = Cache