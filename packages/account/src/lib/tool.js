const { randomBytes } = require('crypto');

module.exports.now = function () {
    const dateTime = Date.now()
    const timestamp = Math.floor(dateTime / 1000)
    return timestamp
}
module.exports.getID = function (length) {
    return randomBytes(length).toString('hex');
}