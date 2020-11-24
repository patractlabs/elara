const redis = require('../lib/redis')
const Result = require('../lib/result')
const crypto = require("crypto");
const { midnight, now, formateDate } = require('../lib/tool');
const Stat = require('./stat');
const KEY = require('./KEY')

class Project {
    constructor(id, status, chain, name, uid, secret, createtime, lasttime, allowlist) {
        this.id = id
        this.status = status
        this.chain = chain
        this.name = name
        this.uid = uid
        this.secret = secret
        this.createtime = createtime
        this.lasttime = lasttime
        this.allowlist = allowlist
    }

    isActive() {
        return 'Active' == this.status ? true : false
    }

    //项目详情
    static async info(pid) {
        let reply = await redis.hgetall(KEY.PROJECTINFO(pid))
        let project
        if (reply && reply.id) {
            project = new Project(reply.id, reply.status, reply.chain, reply.name, reply.uid, reply.secret, reply.cratetime, reply.lasttime, reply.allowlist)
        }

        return Result.WrapResult(project)
    };

    //获取账户下所有项目详情
    static async getAllByAccount(uid) {
        let list = [];
        let projects = [];
        let members = await redis.smembers(KEY.PROJECT(uid))
        for (var i = 0; i < members.length && i < config.projects; i++) {
            projects[i] = await Project.info(members[i])
            if (projects[i].isOk()) {
                list.push(projects[i].data)
            }
        }
        return Result.WrapResult(list)
    }
    static async setStatus(pid, status = 'Active') {
        let reply = await redis.hgetall(KEY.PROJECTINFO(pid))
        if (reply && reply.id) {
            if ('Active' == status) {
                redis.hset(KEY.PROJECTINFO(pid), 'status', status);
            } else {
                redis.hset(KEY.PROJECTINFO(pid), 'status', 'Stop');
            }
        }
    }
    //创建新项目
    static async create(uid, chain, name) {
        const timestamp = now()

        let id = crypto.randomBytes(16).toString('hex');
        let status = 'Active';
        let secret = crypto.randomBytes(16).toString('hex');
        let cratetime = timestamp;
        let lasttime = timestamp;

        redis.hset(KEY.PROJECTINFO(id), 'id', id);
        redis.hset(KEY.PROJECTINFO(id), 'status', status);
        redis.hset(KEY.PROJECTINFO(id), 'chain', chain);
        redis.hset(KEY.PROJECTINFO(id), 'name', name);
        redis.hset(KEY.PROJECTINFO(id), 'uid', uid);
        redis.hset(KEY.PROJECTINFO(id), 'secret', secret);
        redis.hset(KEY.PROJECTINFO(id), 'cratetime', cratetime);
        redis.hset(KEY.PROJECTINFO(id), 'lasttime', lasttime);
        redis.hset(KEY.PROJECTINFO(id), 'allowlist', false);

        await Stat.createProject(uid, id)

        return await Project.info(id)
    }
}

module.exports = Project