const WebSocket = require('ws')
const crypto = require("crypto");
const { toJSON, fromJSON } = require("../../../lib/helper/assist")

class Pool {
    constructor( chain,callback) {
        this.servers=[];
        this.callback=callback
        for( var i=0;i<10;i++){
            let index = Math.floor(Math.random() * config.chain[chain].ws.length)
            this.servers .push(this.connect(chain,config.chain[chain].ws[index]))
        }

}
connect(chain,path) {
    let server = new WebSocket(path)
    let handle_error = async (error) => {
        logger.error('server ws error ', error)
        server.terminate()
        //this.connect(chain)
    }
    server.on('unexpected-response', handle_error)
    server.on('error', handle_error)
    server.on('close', handle_error)
    server.on('open', function (m) {
        console.log('open',chain)
    })
    server.on('message', this.callback)
    return server
}
send(msg){
    let index = Math.floor(Math.random() * this.servers.length)
    this.servers[index].send(toJSON(msg))
}
}
module.exports = Pool