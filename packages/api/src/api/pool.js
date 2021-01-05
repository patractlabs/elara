const WebSocket = require('ws')
const { logger } = require('../../../lib/log')
const kafka = require("../../../lib/kafka")
const CODE = require('../../../lib/helper/code')
const { toJSON, fromJSON } = require("../../../lib/helper/assist")

class Pool {
    constructor( chain,path,callback) {
        this.messengers=[];
        this.callback=callback
        for( var i=0;i<10;i++){
                this.messengers.push(this.initConnect(chain, path))
            }
}
initConnect(chain, path) {
    let mess = new WebSocket(path)
    let handle_error = async (error) => {
        logger.error('server ws error ', error)
        mess.terminate()
        //this.messengers[chain] = this.initConnect(chain, path)//重连
    }
    mess.on('unexpected-response', handle_error)
    mess.on('error', handle_error)
    mess.on('close', handle_error)
    mess.on('open', function (m) {
        console.log(chain + " messenger open")
    })
    mess.on('message', this.callback)

    return mess
}
send(msg){
    let index = Math.floor(Math.random() * this.messengers.length)
    this.messengers[index].send(toJSON(msg))
}
}
module.exports = Pool