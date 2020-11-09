process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'elara',
    port: 7003,
    chain: {
        'Polkadot': {
            'rpc': ['127.0.0.1:9933'],
            'ws': ['127.0.0.1:9944']
        }
    },
    kafka:{
        'kafkaHost':'127.0.0.1:9092',
        'topic':'elara-dev',
        'sasl': { mechanism: 'plain', username: '***', password: '***' }
    },
    statServer:'127.0.0.1:7002'
}
