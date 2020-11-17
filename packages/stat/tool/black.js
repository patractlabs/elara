
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
    .option('--addpid <value>', 'black pid?')
    .option('--delpid <value>', 'remove black pid?')
    .option('--pid <value>', 'pid?')
    .option('--status <value>', 'pid?')

    .parse(process.argv);

if (program.adduid) {
    (async function () {
        await redis.sadd(KEY.BLACKUID(), program.adduid);
        console.log('ADD Black Uid:', program.adduid);
    })()
}
else if (program.deluid) {
    (async function () {
        await redis.srem(KEY.BLACKUID(), program.deluid);
        console.log('Remove Black Uid:', program.deluid);
    })()
}
else if (program.alluid) {
    (async function () {
        let members = await redis.smembers(KEY.BLACKUID())
        for (var i = 0; i < members.length; i++) {
            console.log('Black Uid:', members[i]);
        }
    })()
}
if (program.addpid) {
    (async function () {

        console.log('ADD Black Pid:', program.addpid);
    })()
}
else if (program.delpid) {
    (async function () {

        console.log('Remove Black Uid:', program.delpid);
    })()
}
else if (program.pid) {
    if (program.status) {
        (async function () {
            if ('Active' == program.status || 'Stop' == program.status) {
                await Project.setStatus(program.pid, program.status)
                console.log('Pid:', program.pid, ',Status:', program.status);
            }
            else {
                console.log('status args error!')
            }
        })()

        // {
    }
    else {
        (async function () {
            console.log('Pid:', await Project.info(program.pid));
        })()
    }
}
