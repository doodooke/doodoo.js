const redis = require("redis");
const bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Redis {
    constructor(options = {}) {
        this.options = options.redis || {
            host: doodoo.getConf("redis.host"),
            port: doodoo.getConf("redis.port"),
            url: doodoo.getConf("redis.url"),
            prefix: doodoo.getConf("redis.prefix"),
            password: doodoo.getConf("redis.password")
        };
    }

    getRedis() {
        return redis.createClient(this.options);
    }
}

module.exports = options => {
    doodoo.redis = new Redis(options).getRedis();
};
