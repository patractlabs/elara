process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'elara',
    port: 7003,
    messengers: {
            'polkadot': ['ws://127.0.0.1:7004'],
            'kusama': ['ws://127.0.0.1:7004']
    },
    kafka:{
        'kafkaHost':'127.0.0.1:9092',
        'topic':'elara-dev',
        'sasl': { mechanism: 'plain', username: '***', password: '***' }
    },
    statServer:'127.0.0.1:7002'
}
