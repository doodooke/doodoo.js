const staticCache = require("koa-static-cache");

module.exports = (options = {}) => {
    const dir = options.dir || doodoo.getConf("static.dir");
    const maxAge = options.maxAge || doodoo.getConf("static.maxAge");
    const dynamic = options.dynamic || doodoo.getConf("static.dynamic");

    doodoo.use(
        staticCache(
            dir,
            Object.assign(
                {
                    maxAge,
                    dynamic
                },
                options
            )
        )
    );
};
