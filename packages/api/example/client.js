const { ApiPromise, WsProvider } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');

async function client () {
    // Http
    const httpProvider = new HttpProvider('http://localhost:7003/Polkadot/<PID>')
    const hash = await httpProvider.send('chain_getBlockHash', [])
    console.log('latest block Hash', hash)

    // Websocket
    const wsProvider = new WsProvider('ws://localhost:7003/ws/Polkadot/<PID>')
    const api = await ApiPromise.create({ provider: wsProvider })
    console.log(api.genesisHash.toHex())

    const chain = await api.rpc.system.chain()
    await api.rpc.chain.subscribeNewHeads( async(lastHeader) => {
        console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`)
        await httpProvider.send('chain_getBlockHash', [])
    })

}

for(var i=0;i<10;i++){
    client()
}