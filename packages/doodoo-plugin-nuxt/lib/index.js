const { Nuxt, Builder, Utils } = require("nuxt");
const glob = require("glob");
const yn = require("yn");
const path = require("path");
const _ = require("lodash");
const isDev = (process.env.NODE_ENV || "development") === "development";
const appDir = doodoo.getConf("app.root");

function createRoutes(srcDir) {
    const views = glob.sync("*/view/**/*.vue", {
        cwd: appDir
    });

    const routes = [];
    for (const key in views) {
        const file = path.resolve(appDir, views[key]);
        routes.push({
            name: views[key],
            path:
                "/" +
                views[key]
                    .replace(/\\/g, "/")
                    .replace(/\/view/, "")
                    .replace(/_/g, ":")
                    .replace(/.vue$/, "")
                    .replace(/.index$/, ""),
            component: file,
            chunkName: "pages/app/" + views[key]
        });
    }
    return routes;
}

function createLayouts() {
    const layouts = glob.sync("*/layout/**/*.vue", { cwd: appDir });
    const _layouts = {};
    for (const key in layouts) {
        _layouts[
            path
                .basename(layouts[key])
                .replace(/\\/g, "/")
                .replace(/.vue$/, "")
        ] = Utils.relativeTo(
            path.resolve(".nuxt"),
            path.resolve(appDir, layouts[key])
        );
    }

    return _layouts;
}

// 用指定的配置对象实例化 Nuxt.js
const config = require(path.resolve("./nuxt.config"));
const nuxt = new Nuxt(
    _.merge(
        {
            srcDir: "web",
            layouts: createLayouts(),
            build: {
                createRoutes: srcDir => {
                    return createRoutes(srcDir);
                }
            }
        },
        config,
        { dev: isDev }
    )
);

module.exports = async () => {
    // 在开发模式下启用编译构建和热加载
    if (isDev && yn(process.env.NUXT_BUILD)) {
        const builder = new Builder(nuxt);
        await builder.build();
    }

    doodoo.use(async (ctx, next) => {
        if (
            doodoo.getConf("app.prefix") &&
            ctx.path.indexOf(doodoo.getConf("app.prefix")) === 0
        ) {
            return await next();
        }

        ctx.status = 200;
        ctx.respond = false; // Mark request as handled for Koa
        ctx.req.ctx = ctx; // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
        nuxt.render(ctx.req, ctx.res);
    });
};
