const crypto = require("crypto");
const {
    Sequelize,
    DataTypes,
    Op
} = require('sequelize');
const { logger } = require('../../../lib/log')

class History {
    constructor(router, chain) {
        this.router = router
        this.methods = config.chain[chain].processor.history
        this.replacement_msg = {}
        this.sequelize = new Sequelize(config.history[chain])
        this.blocks = this.sequelize.define("blocks", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            parent_hash: DataTypes.STRING.BINARY,
            hash: DataTypes.STRING.BINARY,
            block_num: DataTypes.INTEGER,
            state_root: DataTypes.STRING.BINARY,
            extrinsics_root: DataTypes.STRING.BINARY,
            digest: DataTypes.STRING.BINARY,
            ext: DataTypes.STRING.BINARY,
            spec: DataTypes.INTEGER
        })
        this.storage = this.sequelize.define("storage", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            block_num: DataTypes.INTEGER,
            hash: DataTypes.STRING.BINARY,
            is_full: DataTypes.BOOLEAN,
            key: DataTypes.STRING.BINARY,
            storage: DataTypes.STRING.BINARY
        }, {
            tableName: 'storage'
        })

    }
    name() {
        return 'history'
    }
    //是否能处理该消息
    contain(request) {
        if ((this.methods.indexOf(request.method) > -1) && (request.params.length > 0)) {
            return true
        }
        return false
    }
    async process(message) {
        let replacement_id = (Buffer.from(crypto.randomBytes(16))).readUIntLE(0, 4)
        this.replacement_msg[replacement_id] = message

        switch (message.request.method) {
            case 'chain_getBlockHash':
                return await this._chainGetBlockHash(message.request, replacement_id);

            case 'state_getStorage':
                return await this._stateGetStorage(message.request, replacement_id);
                return true
            case 'state_queryStorageAt':
                return await this._stateQueryStorageAt(message.request, replacement_id)


            default:
                break;
        }

        return false
    }

    async _queryBlockNumByHash(hash) {
        return await this.blocks.findOne({
            attributes: ['block_num'],
            where: {
                hash: {
                    [Op.eq]: hash
                }
            }
        })
    }
    //找到最新的hash
    async _queryLastestHash() {
        let block_num = await this.blocks.max('block_num')
        return await this.blocks.findOne({
            attributes: ['hash'],
            where: {
                block_num: {
                    [Op.eq]: block_num
                }
            }
        })

    }
    async _stateQueryStorageAt(request, replacement_id) {
        //state_queryStorageAt
        /*
       1 测试用例　有hash 参数
        {"id":123,"chain":"polkadot","request":{"id":52,"jsonrpc":"2.0","method":"state_queryStorageAt","params":[["0x2b06af9719ac64d755623cda8ddd9b94b1c371ded9e9c565e89ba783c4d5f5f9b4def25cfda6ef3a000000007e5180a48cb71c0e3887050ecff59f58658b3df63a16d03a00f92890f1517f48c2f6ccd215e5450e","0xbd2a529379475088d3e29a918cd478721a39ec767bd5269111e6492a1675702a","0x1a736d37504c2e3fb73dad160c55b2918ee7418a6531173d60d1f6a82d8f4d518b48357b68633cb2240a9443007b071a693d0000","0x1a736d37504c2e3fb73dad160c55b2918ee7418a6531173d60d1f6a82d8f4d51a1ceca9e533bdfbc0105765a9c5925a92af70000"],"0xc0096358534ec8d21d01d34b836eed476a1c343f8724fa2153dc0725ad797a90"]}}


        2 测试用例　无hash 参数
        {"id":123,"chain":"polkadot","request":{"id":52,"jsonrpc":"2.0","method":"state_queryStorageAt","params":[["0x2b06af9719ac64d755623cda8ddd9b94b1c371ded9e9c565e89ba783c4d5f5f9b4def25cfda6ef3a000000007e5180a48cb71c0e3887050ecff59f58658b3df63a16d03a00f92890f1517f48c2f6ccd215e5450e","0xbd2a529379475088d3e29a918cd478721a39ec767bd5269111e6492a1675702a","0x1a736d37504c2e3fb73dad160c55b2918ee7418a6531173d60d1f6a82d8f4d518b48357b68633cb2240a9443007b071a693d0000","0x1a736d37504c2e3fb73dad160c55b2918ee7418a6531173d60d1f6a82d8f4d51a1ceca9e533bdfbc0105765a9c5925a92af70000"]]}}

        */
        try {

            let params = []
            for (let i = 0; i < request.params[0].length; i++) {
                params[i] = request.params[0][i].replace('0x', '\\x')
            }
            let where = {
                key: {
                    [Op.or]: params
                }
            }
            let hash = await this._queryLastestHash()
            hash = '\\x' + Buffer.from(hash.hash).toString('hex')
            if (request.params[1]) { //指定了块哈希
                hash = request.params[1].replace('0x', '\\x')
            }
            let block = await this._queryBlockNumByHash(hash) //找到块高
            if (block) {
                let max_block_num = block.block_num
                where = {
                    key: {
                        [Op.or]: params
                    },
                    block_num: {
                        [Op.lte]: max_block_num //<= 指定的块高
                    }
                }
            }

            let key_maxnum = await this.storage.findAll({
                attributes: ['key', [Sequelize.fn('max', Sequelize.col('block_num')), 'maxnum']],
                where: where,
                group: ['key']
            })

            if (key_maxnum.length) {
                let where = {
                    [Op.or]: []
                }
                for (let i = 0; i < key_maxnum.length; i++) {
                    where[Op.or].push({
                        [Op.and]: [{
                            block_num: {
                                [Op.eq]: key_maxnum[i].get('maxnum')
                            }
                        },
                        {
                            key: {
                                [Op.eq]: '\\x' + Buffer.from(key_maxnum[i].key).toString('hex')
                            }
                        }
                        ]
                    })
                }

                this.storage.findAll({
                    attributes: ['key', 'storage'],
                    where: where
                }).then((data) => {
                    if (this.replacement_msg[replacement_id]) {
                        let message = {
                            "jsonrpc": "2.0",
                        }
                        let result = []
                        result[0] = {}
                        result[0].block = hash.replace('\\x', '0x')
                        result[0].changes = []

                        for (let i = 0; i < request.params[0].length; i++) {
                            let k = request.params[0][i]
                            let v = null
                            for (let j = 0; j < data.length; j++) {
                                if (k == '0x' + Buffer.from(data[j].key).toString('hex')) {
                                    if ( null != data[j].storage){
                                        v = '0x' + Buffer.from(data[j].storage).toString('hex')
                                    }
                                    else {
                                        v = ''
                                    }
                                   
                                    break;
                                }
                            }
                            result[0].changes[i] = [k, v]
                        }

                        message.result = result
                        message.id = this.replacement_msg[replacement_id].request.id
                        let id = this.replacement_msg[replacement_id].id
                        let chain = this.replacement_msg[replacement_id].chain
                        this.router.callback(id, chain, message)

                    }
                    delete this.replacement_msg[replacement_id]
                })

                return true
            } else {
                delete this.replacement_msg[replacement_id]
                return false
            }
        } catch (e) {
            logger.error('_stateQueryStorageAt Error', e)
            return false
        }
    }
    async _stateGetStorage(request, replacement_id) {
        //state_getStorage

        /*
        1. 测试用例 有hash参数　
        {"id":123,"chain":"polkadot","request":{"id":1, "jsonrpc":"2.0", "method": "state_getStorage", "params":["0x2b06af9719ac64d755623cda8ddd9b94b1c371ded9e9c565e89ba783c4d5f5f9b4def25cfda6ef3a000000007e5180a48cb71c0e3887050ecff59f58658b3df63a16d03a00f92890f1517f48c2f6ccd215e5450e","0xc0096358534ec8d21d01d34b836eed476a1c343f8724fa2153dc0725ad797a90"]}}

          2 测试用例  无hash参数
           {"id":123,"chain":"polkadot","request":{"id":1, "jsonrpc":"2.0", "method": "state_getStorage", "params":["0x2b06af9719ac64d755623cda8ddd9b94b1c371ded9e9c565e89ba783c4d5f5f9b4def25cfda6ef3a000000007e5180a48cb71c0e3887050ecff59f58658b3df63a16d03a00f92890f1517f48c2f6ccd215e5450e"]}}
        */
        let key = request.params[0].replace('0x', '\\x')
        let where = {
            key: {
                [Op.eq]: key
            }
        }

        if (request.params[1]) { //指定了块哈希
            let hash = request.params[1].replace('0x', '\\x')
            let block = await this._queryBlockNumByHash(hash) //找到块高
            if (block) {
                let max_block_num = block.block_num
                where = {
                    key: {
                        [Op.eq]: key
                    },
                    block_num: {
                        [Op.lte]: max_block_num //<= 指定的块高
                    }
                }
            }
        }
        //找到匹配到的最近块高
        let key_maxnum = await this.storage.findOne({
            attributes: ['key', [Sequelize.fn('max', Sequelize.col('block_num')), 'maxnum']],
            where: where,
            group: ['key']
        })

        if (key_maxnum) {
            this.storage.findOne({
                attributes: ['key', 'storage'],
                where: {
                    block_num: {
                        [Op.eq]: key_maxnum.get('maxnum')
                    },
                    key: {
                        [Op.eq]: key
                    }
                }
            }).then((data) => {
                if (data && this.replacement_msg[replacement_id]) {
                    let result = ''
                    if (null != data.storage) {
                        result = '0x' + Buffer.from(data.storage).toString('hex')
                    }
                    let message = {
                        "jsonrpc": "2.0",
                        "result": result
                    }
                    message.id = this.replacement_msg[replacement_id].request.id
                    let id = this.replacement_msg[replacement_id].id
                    let chain = this.replacement_msg[replacement_id].chain
                    this.router.callback(id, chain, message)

                }
                delete this.replacement_msg[replacement_id]
            })

            return true
        }

        delete this.replacement_msg[replacement_id]
        return false
    }
    async _chainGetBlockHash(request, replacement_id) {
        //chain_getBlockHash
        let params = [];
        for (let i = 0; i < request.params[0].length; i++) {
            params[i] = parseInt(request.params[0][i])
        }
        this.blocks.findAll({
            attributes: ['hash'],
            where: {
                block_num: {
                    [Op.or]: params
                }
            }
        }).then((data) => {
            let result = []
            for (let j = 0; j < data.length; j++) {
                result[j] = '0x' + Buffer.from(data[j].hash).toString('hex')
            }
            if (this.replacement_msg[replacement_id]) {
                let message = {
                    "jsonrpc": "2.0",
                    "result": result
                }
                message.id = this.replacement_msg[replacement_id].request.id
                let id = this.replacement_msg[replacement_id].id
                let chain = this.replacement_msg[replacement_id].chain
                this.router.callback(id, chain, message)
            }
            delete this.replacement_msg[replacement_id]
        })

        return true
    }

}
module.exports = History