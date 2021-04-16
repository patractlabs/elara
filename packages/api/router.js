const router = require('koa-router')()
const fs = require('fs')

const addMapping = (router, mapping) => {
    for (var url in mapping) {
        let methodAndPath = url.split(' ')
        if (methodAndPath.length > 1)
            router[methodAndPath[0].toLowerCase()](
                methodAndPath[1],
                mapping[url]
            )
    }
}

module.exports = function () {
    let files = fs.readdirSync(__dirname + '/src/routers')
    var jsFiles = files.filter((f) => {
        return f.endsWith('js')
    })
    for (var f of jsFiles) {
        let mapping = require(__dirname + '/src/routers/' + f)
        addMapping(router, mapping)
    }

    return router.routes()
}
