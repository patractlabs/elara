const { parentPort } = require('worker_threads');
const { logger } = require('../../../lib/log');


parentPort.on('message', (data) => {
    try {
        for (var i = 0; i < data.req.params.length; i++) {
            delete data.subscription_msg[data.req.params[i]]
        }
        parentPort.postMessage(data.subscription_msg)
    } catch (error) {
        logger.error('worker error:', error)
    }
    
})
