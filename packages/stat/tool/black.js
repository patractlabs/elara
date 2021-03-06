
const config = global.config = require('../config/index')();
const redis = require('../src/lib/redis');
const { logger } = require('../src/lib/log')
const KEY = require('../src/api/KEY')
const Project = require('../src/api/project')
var program = require('commander');

program
    .version('0.1.0')
    .option('--alluid', 'all black uid?')
    .option('--adduid <value>', 'black uid?')
    .option('--deluid <value>', 'remove black uid?')
    .option('--pid <value>', 'pid?')
    .option('--status <value>', 'status?')
    .parse(process.argv);

(async function () {

    if (program.adduid) {
        await redis.sadd(KEY.BLACKUID(), program.adduid);
        console.log('ADD Black Uid:', program.adduid);
    }
    else if (program.deluid) {
        await redis.srem(KEY.BLACKUID(), program.deluid);
        console.log('Remove Black Uid:', program.deluid);
    }
    else if (program.alluid) {
        console.log('All Black:')
        let members = await redis.smembers(KEY.BLACKUID())
        for (var i = 0; i < members.length; i++) {
            console.log('Uid:', members[i]);
        }
    }
    else if (program.pid) {
        if (program.status) {
            if ('Active' == program.status || 'Stop' == program.status) {
                await Project.setStatus(program.pid, program.status)
                console.log('Pid:', program.pid, ',Status:', program.status);
            }
            else {
                console.log('status args error!')
            }
        }
        else {
            console.log('Pid:', await Project.info(program.pid));
        }
    }
    
    process.exit()
})()

