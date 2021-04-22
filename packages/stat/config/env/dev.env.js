process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    keys: ['stat@#^*&'],
    name: 'stat',
    port: 7002,
    session: {
        key: 'sid',
        signed: false,
        maxAge: 2592000000,
        httpOnly: false
    },
    chain: {
        'polkadot': {},
        'westend': {}
    },
    test: false,
    // redis配置
    redis: {
        host: '127.0.0.1',
        port: '6379',
        password: '***'
    },
    kafka: {
        'kafkaHost': '127.0.0.1:9092',
        'topic': 'elara-dev',
        'consumerGroup': 'elara-stat',
        'sasl': { mechanism: 'plain', username: '***', password: '***' }
    },
    limit: {
        daily: {
            '0': 1000000, //开发者
            '1': 5000000//团队
        },
        project: {//账户下最多项目数
            '0': 20,
            '1': 100
        }
    },
    projects: 100,
    timeout: 5000,// ms
    requests: 1000,//最多保留请求记录
}
