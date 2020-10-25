process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    keys: ['elara@#^*&'],
    name: 'elara',
    port: 8001,
    pid:'00000000000000000000000000000000',
    chain: {
        'substrate': {
            'rpc': ['127.0.0.1:9933'],
            'ws': ['127.0.0.1:9944']
        }
    },
    redis: {
	host: '127.0.0.1',
    port: '6379',
    password: '***'    
},
    timeout: 10000,// ms
    requests: 1000//
}
