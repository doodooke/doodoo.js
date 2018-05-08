const redis = require("redis");
const bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

module.exports = class Redis {
    constructor(options = {}) {
        this.options = options.redis || {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            prefix: process.env.REDIS_PREFIX
        };
    }

    getRedis() {
        return redis.createClient(this.options);
    }
};
