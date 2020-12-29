process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'elara',
    port: 7003,
    chain: {
        'Polkadot': {
            'rpc': ['https://polkadot.elara.patract.io'],
            'ws': ['wss://polkadot.elara.patract.io']
        }
    },
    kafka:{
        'kafkaHost':'127.0.0.1:9092',
        'topic':'elara-dev',
        'sasl': { mechanism: 'plain', username: '***', password: '***' }
    },
    statServer:'127.0.0.1:7002'
}
