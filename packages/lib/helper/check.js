function isUnsafe(req) {
    if (-1 == config['unsafe'].indexOf(req.method)) {
        return false
    }

    return true
}
function unSubscription(method) {
    return config['un-subscription'][method]
}
function isUnSubscription(method) {
    for (let i in config['un-subscription']) {
        if (method == config['un-subscription'][i]) {
            return true
        }
    }
    return false
}

function isSubscription(chain, request) {
    if (-1 == config['subscription'].indexOf(request.method)) {
        return false
    }

    return true
}
module.exports = {
    isUnsafe,
    isSubscription,
    unSubscription,
    isUnSubscription,
}
