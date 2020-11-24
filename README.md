[中文](https://github.com/patractlabs/elara/blob/master/README-zh.md)

# elara

In Polkadot, Kusama and other parachains, RPC is the interface between DApp and the network. As the Polkadot network continues to expand, more and more parachains will be online, and more and more parachains will support smart contract functions. Faced with more and more parallel chains, developers need to build and maintain multiple blockchain nodes in order to interact with them, which will be a huge development cost for them. Whether it is facing the development and testing needs of developers or users' online DApp usage requirements, a convenient, fast and stable network access is one of the necessary conditions, and it is also the infrastructure of the Polkadot ecosystem.

Elara is inspired by [Infura](infura.io)  from the Ethereum ecosystem, named after Jupiter’s seventh moon. Elara's goal is to build a similar infrastructure and network public access services to provide developers with a unified access layer based on Substrate multi-chain. In addition, Elara will be used as part of the smart contract development service, and will be integrated with other components of the Patract toolchain in the future, in terms of contract development environment support, development tools component, contract deployment and DApp release. Elara will be Polkadot’s infrastructure, allowing developers to focus on building upper-level applications.

Riot Group for disscusion: https://app.element.io/#/room/#PatractLabsDev:matrix.org


## Summary of Elara's future plan:
### v0.1: Implement Substrate node access  [Proposal 0.1](https://polkadot.polkassembly.io/post/103)

- Create a server-side framework to develop proxy access, automatic monitoring and data statistics to the RPC service of the Substrate node
- Support developers to use http and websocket protocols to uniformly access the network through the server framework
- Develop a front-end dashboard to display relevant monitoring statistics of the RPC service of the Substrate node

### v0.2: Implement function expansion and performance optimisation [Proposal 0.2](https://polkadot.polkassembly.io/post/141)

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
 At present, we have completed the 0.2 version development, you can view the online service [elara.patract.io](https://elara.patract.io/) 

You Can view:
 - 0.1 [Repositorie](https://github.com/patractlabs/elara/tree/0.1/) [ Report ](https://polkadot.polkassembly.io/post/139) 
- 0.2 [Repositorie](https://github.com/patractlabs/elara/tree/0.2/) [ Report ](https://polkadot.polkassembly.io/post/xxx) 


## How To Use
1. Environment
To use Elara, you need Yarn, which itself requires Node.js. If you don't have these tools, you may install them from these instructions:
    - [Install Node.js](https://nodejs.org/en/download/)
    - [Install Yarn](https://yarnpkg.com/lang/en/docs/install/)

2. Installation

    Elara front-end [Repositorie](https://github.com/patractlabs/elara-website)

    Elara backend is divided into three services：
    - [Developer-Account](https://github.com/patractlabs/elara/tree/master/packages/account)　The main function is to maintain the login status of the developer account
    - [Stat](https://github.com/patractlabs/elara/tree/master/packages/stat)　The main function is developer project management and data statistics (shared login state database with Developer-Account Service)
    - [API](https://github.com/patractlabs/elara/tree/master/packages/api)　Mainly responsible for user request proxy access (rely on Stat Service to provide a limited traffic interface)

    Please refer to the README of each service to install **in turn**

3.  Developer access
 After completing the installation and deployment of step 2, you can refer to the README access method of the API Service to send an RPC request to the chain.
   