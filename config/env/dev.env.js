process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    keys: ['abc@#^*&'],
    name: 'elara',
    port: 8001,
    pid:'00000000000000000000000000000000',
    chain: {
        'substrate': {
            'rpc': ['47.99.192.159:8098'],
            'ws': ['47.99.192.159:8099']
        }
    },
    redis: {
        host: 'r-wz919a511967b574pd.redis.rds.aliyuncs.com',
        port: '6379',
        password: 'LinkWeb3'
    },
    timeout: 5000,// ms
    requests: 1000//
}
