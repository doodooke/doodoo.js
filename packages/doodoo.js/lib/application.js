const Koa = require("koa");
const path = require("path");
const _ = require("lodash");
const dayjs = require("dayjs");
const logger = require("koa-logger");
const KoaRouter = require("koa-router");
const body = require("koa-body");
const debug = require("debug")("doodoo");
const dotenv = require("./dotenv/main");
const Hook = require("./core/hook");
const Router = require("./core/router");
const _global = require("./global");
const _context = require("./context");
const Controller = require("./core/controller");
const { notifyError } = require("./core/error");
const pkg = require("./../package.json");

// 加载配置
dotenv.config({
    path: path.resolve(__dirname, "..", ".env")
});
dotenv.config();
dotenv.config({
    path: `${process.env.NODE_ENV}.env`
});

debug("process.env %O", process.env);

// 全局加载
global.doodoo = _global;

/**
 * Class Application
 */
module.exports = class Application extends Koa {
    /**
     * Create a application.
     * @param {object} options - Options
     * @param {string} options.root - App root path
     * @param {string} options.router - App router
     */
    constructor(options = {}) {
        super(options);

        // 加载全局变量
        doodoo = Object.assign(this, _global);
        Object.assign(this.context, _context);

        // this = new Koa();
        this.useBody = false;
        this.useRoute = false;
        this.options = options;
        this.notifyError = notifyError;
        this.start_at = new Date();

        // error
        this.on("error", this.notifyError);

        // hook
        this.hook = new Hook();
        debug("hooks %O", this.hook);

        // router
        this.Controller = Controller;
        this.router = this.options.router || new KoaRouter();
        this.router.prefix(this.options.prefix || process.env.APP_PREFIX);

        // step 1
        this.use(async (ctx, next) => {
            const start = Date.now();

            await next();

            ctx.set("X-Powered-By", "doodoo.js");
            ctx.set("X-Response-Time", `${Date.now() - start}ms`);
        });
        this.use(logger());
    }

    /**
     * Plugin as middleware
     * @param {*} plugin
     * @param {*} options
     */
    plugin(plugin, options) {
        const pluginFn = async () => {
            await _global.usePlugin(plugin, options);
        };
        this.use(pluginFn);
    }

    /**
     * Use express middleware
     * @param {*} fn
     */
    useExpress(fn) {
        this.use(_global.expressMiddlewareToKoaMiddleware(fn));
    }

    /**
     * Use a body middleware
     * @description The middleware is finally loaded by default, which can be manually invoked.
     */
    body() {
        // step 2
        this.useBody = true;
        this.use(async (ctx, next) => {
            await body({ multipart: true })(ctx, async () => {
                if (!ctx.request.body.files) {
                    ctx.post = ctx.request.body;
                } else {
                    ctx.post = ctx.request.body.fields;
                    ctx.file = ctx.request.body.files;
                }
            });

            await next();
        });
    }

    /**
     * Use a route middleware
     * @description The middleware automatically loads routes
     */
    route() {
        // step 3
        this.useRoute = true;

        // router
        this.router = new Router({ router: this.router }).loadRouters();
        debug("router %O", this.router);

        this.use(this.router.routes());
        this.use(this.router.allowedMethods());
    }

    /**
     * Start a server
     * @returns {Server} http.createServer
     */
    async start() {
        // step 4
        const middleware = [].concat(this.middleware);
        for (const key in middleware) {
            if (middleware[key].name === "pluginFn") {
                this.middleware.splice(key, 1);
                const _fn = middleware[key];
                await _fn();
            }
        }

        // step 5
        if (!this.useBody) {
            await this.body();
        }
        if (!this.useRoute) {
            await this.route();
        }

        // context
        Object.assign(this.context, doodoo);

        return (this.server = this.listen(process.env.APP_PORT, this.started));
    }

    async started() {
        // 执行钩子
        await doodoo.hook.run("started");

        console.log(`[doodoo] Version: ${pkg.version}`);
        console.log(`[doodoo] Website: ${process.env.APP_HOST}`);
        console.log(`[doodoo] Nodejs Version: ${process.version}`);
        console.log(
            `[doodoo] Nodejs Platform: ${process.platform} ${process.arch}`
        );
        console.log(
            `[doodoo] Server Enviroment: ${process.env.NODE_ENV ||
                "development"}`
        );
        console.log(
            `[doodoo] Server Startup Time: ${dayjs().diff(doodoo.start_at)}ms`
        );
        console.log(
            `[doodoo] Server Current Time: ${dayjs().format(
                "YYYY-MM-DD HH:mm:ss"
            )}`
        );
        console.log(
            `[doodoo] Server Running At: http://127.0.0.1:${
                process.env.APP_PORT
            }`
        );
    }
};
