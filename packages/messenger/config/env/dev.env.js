process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'messenger',
    port: 7004,
    chain: {
        'polkadot': {
            'rpc': ['https://polkadot.elara.patract.io'],
            'ws': ['wss://polkadot.elara.patract.io'],
            'processors':['node','cache','history','kv']//处理器列表
        },
        'kusama': {
            'rpc': ['https://kusama.elara.patract.io'],
            'ws': ['wss://kusama.elara.patract.io'],
            'processors':['node']
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
            'rpc': ['https://moonbase.elara.patract.io'],
            'ws': ['wss://moonbase.elara.patract.io'],
            'processors': ['node', 'cache']
        },
    },
    history:{
        'polkadot':'postgres://postgres:123@localhost/polkadot_db'
       
    },
    kv:{
        'polkadot':{
            'ws':['ws://127.0.0.1:9002']
        },
        'kusama':{
            'ws':['ws://127.0.0.1:9002']
        }
    },
    pool:1
}
