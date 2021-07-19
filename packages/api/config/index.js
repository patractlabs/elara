const path = require('path')
const extend = require('extend')

module.exports = function config() {
    const env = process.env.NODE_ENV || 'dev'
    console.log('Current NODE_ENV', env)
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
        console.log(err)
        throw JSON.stringify({ test: 'Load Extend Config Error：'+__dirname+'/extend.json' })
    }

    if (config.chain) {
        for (chain in config.chain) {
            config.chain[chain.toLowerCase()] = config.chain[chain]
        }
    }

    // console.log(config)
    return config
}
