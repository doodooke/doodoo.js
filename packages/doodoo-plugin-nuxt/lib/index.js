const { Nuxt, Builder } = require("nuxt");
const yn = require("yn");
const path = require("path");
const isDev = (process.env.NODE_ENV || "development") === "development";

// 用指定的配置对象实例化 Nuxt.js
const config = require(path.resolve("./nuxt.config"));
const nuxt = new Nuxt(Object.assign(config, { dev: isDev }));

module.exports = async () => {
    // 在开发模式下启用编译构建和热加载
    if (isDev && yn(process.env.NUXT_BUILD)) {
        const builder = new Builder(nuxt);
        await builder.build();
    }

    // router必须在nuxt前加载
    let dispatch = false;
    doodoo.middleware.forEach(m => {
        if (m.name === "dispatch") {
            dispatch = true;
            return;
        }
    });
    if (!dispatch && !process.env.APP_PREFIX) {
        throw new Error(
            "SyntaxTips: Router Must Load Before Nuxt Or Set APP_PREFIX"
        );
    }

    doodoo.use(async (ctx, next) => {
        if (
            process.env.APP_PREFIX &&
            ctx.path.indexOf(process.env.APP_PREFIX) === 0
        ) {
            return await next();
        }

        ctx.status = 200;
        ctx.respond = false; // Mark request as handled for Koa
        ctx.req.ctx = ctx; // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
        nuxt.render(ctx.req, ctx.res);
    });
};
