const staticCache = require("koa-static-cache");

module.exports = (options = {}) => {
    const dir = options.dir || process.env.STATIC_DIR;
    const maxAge = options.maxAge || process.env.STATIC_MAXAGE;
    const dynamic = options.dynamic || process.env.STATIC_DYNAMIC;

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
