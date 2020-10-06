const path = require('path')
const extend = require('extend')

module.exports = function config() {
    const env = process.env.NODE_ENV || 'dev'
    const config = {}

    const envPath = path.resolve(__dirname + `/env/${env}.env.js`)
    try {
        extend(config, require(envPath))
    } catch (err) {
        throw JSON.stringify({ text: `Load ${env} Config Error：${envPath}` })
    }

    try {
        extend(true, config, require(path.resolve(__dirname + '/extend.json')))
    } catch (err) {
        throw JSON.stringify({ test: `Load Extend Config Error：./config/extend.json` })
    }

    return config
}
