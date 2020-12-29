function isUnsafe(req) {
    if( -1 == config.methods.unsafe.indexOf(req.method)  ){
        return false
    }

    return true
}

module.exports = {
    isUnsafe
}