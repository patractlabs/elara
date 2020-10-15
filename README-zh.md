# elara

在Polkadot、Kusama或Parachain中，RPC是Dapp与网络交互的界面。随着Polkadot网络的不断扩展，会有越来越多的平行链上线，也会有越来越多的平行链支持智能合约功能。面对越来越多的平行链，开发者们为了与之交互需要搭建并维护多条链的节点RPC，这对于他们而言将是巨大的开发成本。

无论是面对开发者的开发测试需要，还是用户线上对Dapp的使用需求，方便便捷、快速稳定的网络接入能力都是必备条件之一。因此，为开发者们和普通用户提供统一简化的网络接入服务能力是服务Dapp开发者的必要支撑，也是Polkadot生态的基础设施。

类比于以太坊，本提案的目标是构建一个类似[Infura](infura.io) 的基础架构和网络公共接入服务,为开发者提供多链接入的统一接入层。 我们将创建一个普适的架构，可以很方便接入Polkadot、Kusama、各个平行链和各个substrate链，即专注于为Polkadot、Kusama服务，也保持扩展性，普惠整个Substrate生态。

另外，本项目将作为智能合约开发生态服务的一部分，在未来将与Patract Suite的其他组件进行整合，在合约开发环境支持、开发工具组件、合约部署和应用发布等方面进行全方位整合，简化应用基础架构，让开发者可以专注于构建上层应用。

Riot Group for disscusion: https://app.element.io/#/room/!RZjiuwwssNFJZxaTjg:matrix.org

## 开发路线图

本项目分为四大里程碑实现，我们将分版本交付如下解决方案和服务：

- v0.1：实现Substrate 节点接入

  - 创建一个服务端框架，实现对Substrate节点Rpc服务的代理接入、自动化监控和数据统计

  - 支持开发者以Http和websocket协议通过该服务端框架统一接入网络
  - 开发一个前端仪表盘，展示Substrate节点rpc服务的相关监控统计数据
  
- v0.2：实现功能扩展和性能优化

  - 实现账户空间功能，支持开发者github第三方登录系统，为开发者建立账户空间
  - 支持账户空间下建立多个项目
  - 为开发者提供Dapp项目维度的详细接入统计功能，展示项目每天、每周的请求量、调用方法、用户群请求来源等统计指标
  - 优化程序性能

  
- v0.3：实现多链接入

  - 扩展程序结构，支持多链架构
  - 接入Polkadot、Kusama、智能合约测试网（Jupiter）
  - 向开发者提供Polkadot、Kusama、智能合约测试网（Jupiter）的公共接入服务
  - 提供多链的接口文档说明

- v0.4：实现Polkadot生态接入&服务运维

  - 在github中建立平行链接入流程自动化规范
  - 接入Polkadot生态更多的平行链
  - 在全球部署运维百个节点
  - 支持服务10000个开发者，每个开发者账户可以建立20个Dapp项目，每个Dapp项目可以使用100w/天的接入服务

## 当前开发进度


当前，我们已完成0.1 版本开发，可以查看线上 [demo](https://elara.patract.io/demo)


## 如何使用代码

1. 环境

    Elara依赖Node和Yarn，如果你的服务器上没有，可以从这些指示安装它们：
    - [Install Node.js](https://nodejs.org/en/download/)
    - [Install Yarn](https://yarnpkg.com/lang/en/docs/install/)

   
2. 安装
    ```
        # Clone the code from github
        git clone https://github.com/patractlabs/elara.git

        # Install the dependencies
        cd elara
        yarn install
    ```

3. 准备

    - Elara使用[Redis](https://github.com/redis/redis)作为存储组件，你需要准备好一个Redis运行实例（可以自建也可以使用云服务提供的Redis服务），在下面的配置环境将会使用到实例的Host/Port/password．
    - 运行Substrate节点，并开启运行参数　`--ws-port ` 　` --rpc-port `　`--rpc-cors all` ` --rpc-external`  `--ws-external`.在下面的配置环节将会用到节点的IP和Port.  [查看官方文档如何创建Substrate链](https://substrate.dev/docs/en/tutorials/create-your-first-substrate-chain/)

   
4. 配置

    ```
    # Edit elara/config/env/dev

    chain: {
        'substrate': {
            'rpc': ['****:**'], //配置为步骤３中的节点IP:RPC端口
            'ws': ['****:**'] //配置为步骤３中的节点IP:WS端口
        }
    },
    redis: {
        host: '***', //配置为步骤３中的Redis实例的Host
        port: '***',//配置为步骤３中的Redis实例的Port
        password: '***'//配置为步骤３中的Redis实例的Password
    }
    ```
    
5. 启动服务

    你可以当前进程启动
    ```
    node app.js
    ```
    或者使用[pm2](https://github.com/Unitech/pm2)管理进程
    ```
    pm2 start pm2.json --env dev
    ```

    日志路径：`elara/logs/`

6. 启动仪表盘
    ```
    cd ./daemon
    nohub node dashboard.js &
    ```

7. 开发者接入

   
    - 方式一 :　curl 发送http请求:
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
    - 方式二 :　wscat 发送Websocket请求:
    ```
    parachain@ubuntu:~/elara$ wscat  -c ws://localhost:8001/
    Connected (press CTRL+C to quit)
    > {"id":1,"jsonrpc":"2.0","method":"chain_getBlock","params":[]}
    < {响应...}
    > 
    ```
     - 方式三 : 使用SDK

        可以引用[polkadot-js](https://github.com/polkadot-js)，使用以下类似代码以Http或Websocket接入节点．


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

        我们也在`elara/example/`下提供了参考示例.
        可以执行示例:
        ```
        node client.js
        ```
    
8. 验证

    你可以打开`http://localhost:8001/demo`　查看监控仪表盘页面．如果有接入请求，仪表盘会展示最新的请求信息．