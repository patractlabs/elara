process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'messenger',
    port: 7005,
    chain: {
        'polkadot': {
            'rpc': ['http://127.0.0.1:9933'],
            'ws': ['ws://127.0.0.1:9944'],
            'processors': ['node', 'cache']//处理器列表
        },
        'kusama': {
            'rpc': ['https://kusama.elara.patract.io'],
            'ws': ['wss://kusama.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'jupiter': {
            'rpc': ['https://jupiter-poa.elara.patract.io'],
            'ws': ['wss://jupiter-poa.elara.patract.io'],
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
            'ws': ['wss://edgeware.elara.patract.io'],
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
        },
        'chainx': {
            'rpc': ['https://chainx.elara.patract.io'],
            'ws': ['wss://chainx.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'westend': {
            'rpc': ['https://westend.elara.patract.io'],
            'ws': ['wss://westend.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'subsocial': {
            'rpc': ['https://subsocial.elara.patract.io'],
            'ws': ['wss://subsocial.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'moonbase': {
            'rpc': ['https://moonbase.moonbeam.elara.patract.io'],
            'ws': ['wss://moonbase.moonbeam.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'statemine': {
            'rpc': ['https://statemine.kusama.elara.patract.io'],
            'ws': ['wss://statemine.kusama.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'westmint': {
            'rpc': ['https://westmint.westend.elara.patract.io'],
            'ws': ['wss://westmint.westend.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'karura': {
            'rpc': ['https://karura.kusama.elara.patract.io'],
            'ws': ['wss://karura.kusama.elara.patract.io'],
            'processors': ['node', 'cache']
        },
        'moonriver': {
            'rpc': ['https://moonriver.kusama.elara.patract.io'],
            'ws': ['wss://moonriver.kusama.elara.patract.io'],
            'processors': ['node', 'cache']
        }
    },
    history: {
    },
    kv:{
        'polkadot':{
            'ws':['ws://127.0.0.1:9002']
        },
        'kusama':{
            'ws':['ws://127.0.0.1:9002']
        }
    },
    pool: 100
}