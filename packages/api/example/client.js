const { ApiPromise, WsProvider } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');

let clients = []
async function client(i) {

    // Http
    // const httpProvider = new HttpProvider('https://test-api.elara.patract.io/Polkadot/532214a1f7de919f9ea90ee4810e0046')
    // const hash = await httpProvider.send('chain_getBlockHash', [])
    // console.log('latest block Hash', hash)

    // Websocket
    const wsProvider = new WsProvider('ws://127.0.0.1:7003/polkadot/f17686f167847021d7f03ee14610024a')
    const api = await ApiPromise.create({ provider: wsProvider })
    console.log('client=', i, api.genesisHash.toHex())
    const chain = await api.rpc.system.chain()
    let index = i
    await api.rpc.chain.subscribeNewHeads(async (lastHeader) => {
        clients[index] = { 'number': `${lastHeader.number}`, 'time': (new Date()).getTime() }
        console.log(index, `${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`)
        //await httpProvider.send('chain_getBlockHash', [])
    })
}

let max = 20;
for (var i = 0; i < max; i++) {
    client(i)
}

let timeout = 1000 * 1000 * 20
setInterval(() => {
    for (let i = 0; i < max; i++) {
        if (!clients[i] || !clients[i].time)
            continue

        let now = (new Date()).getTime()
        if (clients[i].time > (now + timeout)) {
            console.log('Warn Timeout', i, clients[i])
        }
        //console.log(i,clients[i])

    }
}, 10000)