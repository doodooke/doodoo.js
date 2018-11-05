const yn = require("yn");
const redis = require("redis");
const bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Redis {
    constructor(options = {}) {
        this.options = options.redis || {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            prefix: process.env.REDIS_PREFIX,
            password: process.env.REDIS_PASSWORD
        };
    }

    getRedis() {
        return redis.createClient(this.options);
    }
}

module.exports = options => {
    if (yn(process.env.REDIS)) {
        doodoo.redis = new Redis(options).getRedis();
    }
};
