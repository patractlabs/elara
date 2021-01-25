process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'

module.exports = {
    name: 'messenger',
    port: 7004,
    chain: {
        'polkadot': {
            'rpc': ['https://polkadot.elara.patract.io'],
            'ws': ['wss://polkadot.elara.patract.io'],
            'processors':['node','cache','history']//处理器列表
        },
        'kusama': {
            'rpc': ['https://kusama.elara.patract.io'],
            'ws': ['wss://kusama.elara.patract.io'],
            'processors':['node']
        }
    },
    history:{
        'polkadot':'postgres://postgres:123@localhost/polkadot_db'
       
    },
    pool:1
}