
global.config = require('../config/index')();
const redis = require('../../lib/redis');
const KEY = require('../src/api/KEY')
var program = require('commander');

program
    .version('0.1.0')
    .option('-m --modify', 'Boolean, tell commander to modify the user info')
    .option('-u --uid <value>', 'uid value')
    .option('-v --vip <value>', 'vip value is 0 | 1')
program.parse(process.argv);

(async function () {
    const options = program.opts();

    if(options.uid) {
        const user = await redis.hget(KEY.UID(options.uid), 'vip');
        if(!user) {
            console.log('用户不存在')
        }
        // 修改
        if(options.modify) {
            if(options.vip) {
                if(['0','1'].includes(options.vip))
                await redis.hset(KEY.UID(options.uid), 'vip', options.vip);
            } else {
                console.log('请输入要修改的参数');
            }
            
        }
    } else {
        console.log('请输入uid');
    }  
    
    process.exit()
})()

