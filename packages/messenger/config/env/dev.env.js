process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'messenger',
    port: 7004,
    chain: {
        'polkadot': {
            'rpc': ['https://polkadot.elara.patract.io'],
            'ws': ['wss://polkadot.elara.patract.io'],
            'processors':['node','cache']//处理器列表
        },
        'kusama': {
            'rpc': ['https://kusama.elara.patract.io'],
            'ws': ['wss://kusama.elara.patract.io'],
            'processors':['node']
        }
    },
    pool:10
}
