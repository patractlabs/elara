const redis = require("./redis");
const { Store } = require("koa-session2");

class RedisStore extends Store {
    constructor() {
        super();
    }

    async get(sid, ctx) {
        let data = await redis.get(`SESSION:${sid}`);
        return JSON.parse(data);
    }

    async set(session, { sid = this.getID(24), maxAge = 86400000 } = {}, ctx) {
        try {
            // Use redis set EX to automatically drop expired sessions
            await redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000);
        } catch (e) {
            console.log(e)
        }
        return sid;
    }

    async destroy(sid, ctx) {
        return await redis.del(`SESSION:${sid}`);
    }
}

module.exports = RedisStore;