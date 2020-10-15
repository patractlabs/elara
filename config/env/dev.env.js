process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    keys: ['elara@#^*&'],
    name: 'elara',
    port: 8001,
    pid:'00000000000000000000000000000000',
    chain: {
        'substrate': {
            'rpc': ['localhost:9999'],
            'ws': ['localhost:8888']
        }
    },
    redis: {
        host: '***',
        port: '6379',
        password: '***'
    },
    timeout: 10000,// ms
    requests: 1000//
}
