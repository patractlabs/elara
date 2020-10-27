[中文](https://github.com/patractlabs/elara/blob/master/README-zh.md)

# elara

In Polkadot, Kusama and other parachains, RPC is the interface between DApp and the network. As the Polkadot network continues to expand, more and more parachains will be online, and more and more parachains will support smart contract functions. Faced with more and more parallel chains, developers need to build and maintain multiple blockchain nodes in order to interact with them, which will be a huge development cost for them. Whether it is facing the development and testing needs of developers or users' online DApp usage requirements, a convenient, fast and stable network access is one of the necessary conditions, and it is also the infrastructure of the Polkadot ecosystem.

Elara is inspired by [Infura](infura.io)  from the Ethereum ecosystem, named after Jupiter’s seventh moon. Elara's goal is to build a similar infrastructure and network public access services to provide developers with a unified access layer based on Substrate multi-chain. In addition, Elara will be used as part of the smart contract development service, and will be integrated with other components of the Patract toolchain in the future, in terms of contract development environment support, development tools component, contract deployment and DApp release. Elara will be Polkadot’s infrastructure, allowing developers to focus on building upper-level applications.

Riot Group for disscusion: https://app.element.io/#/room/#PatractLabsDev:matrix.org


## Summary of Elara's future plan:
### v0.1: Implement Substrate node access

- Create a server-side framework to develop proxy access, automatic monitoring and data statistics to the RPC service of the Substrate node
- Support developers to use http and websocket protocols to uniformly access the network through the server framework
- Develop a front-end dashboard to display relevant monitoring statistics of the RPC service of the Substrate node

### v0.2: Implement function expansion and performance optimisation

- Create account space for developers, support developers to use Github as a third-party login method
- Support multiple projects under the account space
- Provide developers with detailed access information of the DApp project by multiple dimensions, including statistical indicators such as daily and weekly requests, calling methods, and source of user group requests
- Optimise program performance

### v0.3: Implement multi-link entry

- Extended program structure, support multi-chain architecture
- Access to Polkadot, Kusama, and other blockchains, such as Jupiter
- Provide developers with public access services of Polkadot, Kusama, and other parachains, such as Jupiter
- Provide multi-chain interface documentation

### v0.4: Implement Polkadot ecological access & service operation and maintenance

- Establish a parallel link in Github to enter the process automation specification
- Access to more parallel chains in the Polkadot ecosystem
- Deploy and maintain hundreds of nodes globally
- Support 10,000 developers, each developer account can establish 20 DApp projects, and each DApp project can use 1M daily access service

## Current Development Progress
 At present, we have completed the 0.1 version development, you can view the online [Elara Dashboard](https://elara.patract.io/dashboard)

## How To Use
1. Environment
To use Elara, you need Yarn, which itself requires Node.js. If you don't have these tools, you may install them from these instructions:
    - [Install Node.js](https://nodejs.org/en/download/)
    - [Install Yarn](https://yarnpkg.com/lang/en/docs/install/)

2. Installation
    ```
        # Clone the code from github
        git clone https://github.com/patractlabs/elara.git

        # Install the dependencies
        cd elara
        yarn install
    ```

3. Preparation

    - Elara uses [Redis](https://github.com/redis/redis) as a storage component, you need to prepare a redis running instance (you can build it yourself or use the redis service provided by a cloud service). In the following configuration phase, the Host/Port/Password of the instance will be used

    - Run the Substrate node and open operating parameters  `--ws-port ` 　` --rpc-port `　`--rpc-cors all` ` --rpc-external`  `--ws-external`. The IP and Port of the node will be used in the following configuration phase. [See the official document how to create a substrate chain](https://substrate.dev/docs/en/tutorials/create-your-first-substrate-chain/)

4. Configuration
    you need to modify config file for Elara:

   ```bash
   vim config/env/dev.env.js
   ```

   And you can see:

   ```javascript
   process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'
   
   module.exports = {
       keys: ['elara@#^*&'],
       name: 'elara',
       port: 8001,  // this port is elara server, receive all client request(inlude rpc and websocket) and dashbord server port
       pid:'00000000000000000000000000000000',
       chain: {
           'substrate': {
               'rpc': ['127.0.0.1:9933'], // the substrate node rpc port
               'ws': ['127.0.0.1:9944'] // the substrate node websocket port
           }
       },
       redis: { // the redis config
           host: '127.0.0.1',
           port: '6379',
           password: ''
       },
       timeout: 10000,// ms
       requests: 1000//
   }
   ```

   In this config file, you should pay attention to 3 fields:

   1. `port`: this field is used for Elara server, all client request will go though this port, including RPC reuqest and websocket request.
   2. `chain/substrate` : this field is used for connecting Substrate node, should match `--ws-port` and `--rpc-port` for Substrate node. If Substrate node do not set this two parameters, the default values are `9944` and `9933`.
   3. `redis` : this field is used for connecting redis instance, please notice the password should be set in production environment.
        ```

5. Start the service

    You can start in the current process
    ```
        node app.js
    ```
    Or use [pm2](https://github.com/Unitech/pm2) to management process
    ```
        pm2 start pm2.json --env dev
    ```

    You can find the running log in this directory: `elara/ logs/`


6. 　Start the Dashboard
    ```
    cd ./daemon
    nohub node dashboard.js &
    ```

 7. Developer access

   
    - Method 1 : use curl to send HTTP request:
        ```
        #curl http
        curl --location --request POST 'http://localhost:8001' \
            --header 'Content-Type: application/json' \
            --data-raw '{
                "id":1,
                "jsonrpc":"2.0",
                "method":"chain_getBlock",
                "params":[]
            }'
        ```
    - Method 2: use [wscat](https://github.com/websockets/wscat) to send websocket request:
        ```
        parachain@ubuntu:~/elara$ wscat  -c ws://localhost:8001/
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
        const httpProvider = new HttpProvider('http://localhost:8001')
        const hash = await httpProvider.send('chain_getBlockHash', [])
        console.log('latest block Hash', hash)

        // Websocket
        const wsProvider = new WsProvider('ws://localhost:8001')
        const api = await ApiPromise.create({ provider: wsProvider })
        //Do something

        })()

        ```
        We also provide reference examples under `elara/example/`.
        Examples can be executed:

        ```
        node client.js
        ```
    
8. verification

    You can open `http://localhost:8001/dashboard`　to view the monitoring dashboard page. If there is an access request, the dashboard will display the latest request information．
>>>>>>> dev
