const { randomBytes } = require('crypto')
const { logger } = require('../log')

module.exports.midnight = function () {
    let today = new Date(new Date().setHours(0, 0, 0, 0))
    return (today = today / 1000)
}

module.exports.now = function () {
    const dateTime = Date.now()
    const timestamp = Math.floor(dateTime / 1000)
    return timestamp
}

module.exports.formateDate = function (fullDate) {
    var yyyy = fullDate.getFullYear()
    var MM =
        fullDate.getMonth() + 1 >= 10
            ? fullDate.getMonth() + 1
            : '0' + (fullDate.getMonth() + 1)
    var dd =
        fullDate.getDate() < 10 ? '0' + fullDate.getDate() : fullDate.getDate()
    return yyyy + '' + MM + '' + dd
}

module.exports.sleep = function (time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(' enough sleep~')
        }, time)
    })
}

module.exports.getID = function (length) {
    return randomBytes(length).toString('hex')
}

module.exports.toJSON = function (m) {
    return JSON.stringify(m)
}

module.exports.fromJSON = function (m) {
    try {
        let json = JSON.parse(m)
        return json
    } catch (e) {
        logger.error('fromJSON ', e)
    }
}
