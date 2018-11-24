const Koa = require("koa");
const path = require("path");
const _ = require("lodash");
const dayjs = require("dayjs");
const logger = require("koa-logger");
const KoaRouter = require("koa-router");
const body = require("koa-body");
const debug = require("debug")("doodoo");
const Hook = require("./core/hook");
const Router = require("./core/router");
const _global = require("./global");
const _context = require("./context");
const Controller = require("./core/controller");
const { notifyError } = require("./core/error");
const pkg = require("./../package.json");

// 全局加载
global.doodoo = _global;

// 加载配置
doodoo.config = doodoo.yamlLoad(path.resolve(__dirname, "..", "config.yaml"));
Object.assign(
    doodoo.config,
    doodoo.yamlLoad("config.yaml"),
    doodoo.yamlLoad(`${process.env.NODE_ENV}.config.yaml`)
);
doodoo.getConf = path => {
    return _.get(doodoo.config, path);
};

debug("doodoo.config %O", doodoo.config);

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
        doodoo = Object.assign(this, doodoo);
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

        // controller
        this.Controller = Controller;

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
        this.router = this.options.router || new KoaRouter();
        this.router.prefix(this.options.prefix || doodoo.getConf("app.prefix"));
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
        const _middleware = this.middleware;
        this.middleware = [];
        for (const key in _middleware) {
            if (_middleware[key].name === "pluginFn") {
                const _fn = _middleware[key];
                await _fn();
            } else {
                this.middleware.push(_middleware[key]);
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

        return (this.server = this.listen(
            doodoo.getConf("app.port"),
            this.started
        ));
    }

    async started() {
        // 执行钩子
        await doodoo.hook.run("started");

        console.log(`[doodoo] Version: ${pkg.version}`);
        console.log(`[doodoo] Website: ${doodoo.getConf("app.host")}`);
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
            `[doodoo] Server Running At: http://127.0.0.1:${doodoo.getConf(
                "app.port"
            )}`
        );
    }
};
