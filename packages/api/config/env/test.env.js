process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'elara',
    port: 7003,
    messengers: {
        polkadot: ['ws://127.0.0.1:7005'],
        kusama: ['ws://127.0.0.1:7005'],
        jupiter: ['ws://127.0.0.1:7005'],
        rococo: ['ws://127.0.0.1:7005'],
        darwinia: ['ws://127.0.0.1:7005'],
        dock: ['ws://127.0.0.1:7005'],
        edgeware: ['ws://127.0.0.1:7005'],
        kulupu: ['ws://127.0.0.1:7005'],
        nodle: ['ws://127.0.0.1:7005'],
        plasm: ['ws://127.0.0.1:7005'],
        stafi: ['ws://127.0.0.1:7005'],
        mandala: ['ws://127.0.0.1:7005'],
    },
    kafka: {
        kafkaHost: '127.0.0.1:9092',
        topic: 'elara-dev',
        sasl: { mechanism: 'plain', username: '***', password: '***' },
    },
    statServer: '127.0.0.1:7002',
    pool: 10,
}
