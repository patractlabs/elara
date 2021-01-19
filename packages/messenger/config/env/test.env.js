process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'messenger',
    port: 7005,
    chain: {
        'polkadot': {
            'rpc': ['https://polkadot.elara.patract.io'],
            'ws': ['wss://polkadot.elara.patract.io'],
            'processors': ['node', 'cache']//处理器列表
        },
        'kusama': {
            'rpc': ['https://kusama.elara.patract.io'],
            'ws': ['wss://kusama.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'jupiter': {
            'rpc': ['https://jupiter.elara.patract.io'],
            'ws': ['wss://jupiter.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'rococo': {
            'rpc': ['https://rococo.elara.patract.io'],
            'ws': ['wss://rococo.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'darwinia': {
            'rpc': ['https://darwinia.elara.patract.io'],
            'ws': ['wss://darwinia.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'dock': {
            'rpc': ['https://dock.elara.patract.io'],
            'ws': ['wss://dock.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'edgeware': {
            'rpc': ['https://edgeware.elara.patract.io'],
            'ws': ['wss://edgeware.elara..patract.io'],
            'processors': ['node', 'cache']
        },
        'kulupu': {
            'rpc': ['https://kulupu.elara.patract.io'],
            'ws': ['wss://kulupu.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'nodle': {
            'rpc': ['https://nodle.elara.patract.io'],
            'ws': ['wss://nodle.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'plasm': {
            'rpc': ['https://plasm.elara.patract.io'],
            'ws': ['wss://plasm.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'stafi': {
            'rpc': ['https://stafi.elara.patract.io'],
            'ws': ['wss://stafi.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'mandala': {
            'rpc': ['https://mandala.elara.patract.io'],
            'ws': ['wss://mandala.elara.patract.io'],
            'processors': ['node', 'cache']
        }
    },
    history: {
    },
    pool: 10
}