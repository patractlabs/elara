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

    if (config.chain) {
        for (chain in config.chain) {
         
            try {
                extend(true, config.chain[chain], require(path.resolve(__dirname + '/substrate.json')))
                extend(true, config.chain[chain], require(path.resolve(__dirname + '/'+chain+'.json')))
            } catch (err) {
                console.log('Load Extend Config Error：'+__dirname+'/'+chain+'.json')// ,err)
            }
        }
    }

    console.log(config)
    return config
}
