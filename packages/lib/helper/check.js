function isUnsafe(req) {
    if( -1 == config.methods.unsafe.indexOf(req.method)  ){
        return false
    }

    return true
}
function unSubscription(method){
    return config['un-subscription'][method]
}

function isSubscription(chain,request){
    if( -1 == config.chain[chain].methods.subscription.indexOf(request.method)  ){
        return false
    }

    return true
}
module.exports = {
    isUnsafe,
    isSubscription,
    unSubscription
}