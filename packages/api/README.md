# elara-api
Elara API Server

Based on the Koa framework, and Kafka is used for message queues

## How to use
 1. Install the dependencies
```
    yarn install 
```
2. Prepare
- Run the Polkadot/Substrate node and open operating parameters  `--ws-port ` 　` --rpc-port `　`--rpc-cors all` ` --rpc-external`  `--ws-external`. The IP and Port of the node will be used in the following configuration phase. [See the official document how to create a substrate chain](https://substrate.dev/docs/en/tutorials/create-your-first-substrate-chain/)
- uses [Kafka](http://kafka.apache.org/) As a Message middleware, you need to prepare a kafka running instance (you can build it yourself or use the redis service provided by cloud service). In the following configuration phase, the Host/Port/Password of the instance will be used.
- make sure your [Stat Service](https://github.com/patractlabs/elara/tree/master/packages/stat) is running. 

3. Configuration
```
    # Edit ./config/env/dev.env.js
     chain: {
            'Polkadot': {
                'rpc': ['****:**'], //configure as node http://IP: RPC port in step 2
                'ws': ['****:**'] //configure as node ws://IP: WS port in step 2
            }
        },
    kafka: {
        'kafkaHost': '127.0.0.1:9092', configure it as the host and port of the kafka instance in step 2
        'topic': 'elara-dev',
        'sasl': { mechanism: 'plain', username: '***', password: '***' }
    },
     statServer:'127.0.0.1:7002' // configure as the hoat and port of the Stat Service in step 2
```

 4. Start Service
 
 You can start the current process

```
    node app.js
```

Or use [pm2](https://github.com/Unitech/pm2) Management process


```
    pm2 start pm2.json --env dev
```

You can find the running log in this directory `./logs/`



5. Developer access

    **Before Access.You must have a PID(project id).you can send a post request to the Stat Service to create a new project and get a PID. You can view the [Interface detail ](https://github.com/patractlabs/elara/tree/0.2/packages/stat#3-new-project)**
   
    - Method 1 : curl sends HTTP request:
        ```
        #curl http
        curl --location --request POST 'http://127.0.0.1:7003/Polkadot/<PID>' \
            --header 'Content-Type: application/json' \
            --data-raw '{
                "id":1,
                "jsonrpc":"2.0",
                "method":"chain_getBlock",
                "params":[]
            }'
        ```

    - Method 2: [wscat](https://github.com/websockets/wscat) sends websocket request:
        ```
        parachain@ubuntu:~/elara$ wscat  -c ws://127.0.0.1:7003/Polkadot/<PID>
        Connected (press CTRL+C to quit)
        > {"id":1,"jsonrpc":"2.0","method":"chain_getBlock","params":[]}
        < {Response data...}
        > 
        ```
     - Method 3 : Using the SDK
    
        You can refer to [polkadot-js](https://github.com/polkadot-js), use the following similar code to access the node with HTTP or websocket：


        ```
        const { ApiPromise, WsProvider } = require('@polkadot/api');
        const { HttpProvider } = require('@polkadot/rpc-provider');

        (async function () {
        // Http
        const httpProvider = new HttpProvider('http://127.0.0.1:7003/Polkadot/<PID>')
        const hash = await httpProvider.send('chain_getBlockHash', [])
        console.log('latest block Hash', hash)

        // Websocket
        const wsProvider = new WsProvider('ws://127.0.0.1:7003/Polkadot/<PID>')
        const api = await ApiPromise.create({ provider: wsProvider })
        //Do something

        })()

        ```
        We also provide reference examples under `./example/`.
        Examples can be executed:

        ```
        node client.js
        ```
    
6. verification

   Now. You can open the Dashboard of Stat Service(in in step 2) view the monitoring dashboard page. If there is an access request, the dashboard will display the latest request information．


## Interface
- Http/Https Access

    METHOD:POST 

    URL:  /＜chain＞/＜PID＞

    *PID=[a-z0-9]{32}*

-  WebSocket Access

    URL: /ws/＜chain＞/＜PID＞

    *PIDd=[a-z0-9]{32}*