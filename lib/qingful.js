const Koa = require("koa");
const yn = require("yn");
const _ = require("lodash");
const path = require("path");
const typeis = require("type-is");
const moment = require("moment");
const koaLogger = require("koa-logger");
const koaStatic = require("koa-static-cache");
const koaBody = require("koa-body");
const getRawBody = require("raw-body");
const debug = require("debug")("qingful");
const dotenv = require("./dotenv/main");
const Hook = require("./core/hook");
const Model = require("./core/model");
const Router = require("./core/router");
const Redis = require("./core/redis");
const _global = require("./global");
const Controller = require("./core/controller");
const { notifyError } = require("./core/error");
const pkg = require("./../package.json");

// v1
const V1Controller = require("./core/v1/controller");

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
global.qingful = _global;

/**
 * Class Qingful
 */
class Qingful {
    /**
     * Create a qingful.
     * @param {object} options - Options
     * @param {string} options.root - App root path
     * @param {string} options.router - App router
     */
    constructor(options = {}) {
        // 加载全局变量
        qingful = Object.assign(this, _global);

        this.koa = new Koa();
        this.useBody = false;
        this.useCore = false;
        this.useGogs = false;
        this.useVersion = false;
        this.options = options;
        this.notifyError = notifyError;
        this.start_at = new Date();

        // error
        this.koa.on("error", this.notifyError);

        // step 1
        this.koa.use(koaLogger());
        this.koa.use(async (ctx, next) => {
            ctx.set("X-Powered-By", "qingful");

            try {
                await next();
            } catch (err) {
                throw err;
            }
        });
    }

    get version() {
        return process.env.APP_VERSION || "v1";
    }

    /**
     * Core loader
     */
    core() {
        if (!this.useVersion) {
            this[this.version]();
        }

        this.useCore = true;
        // model
        if (yn(process.env.MYSQL)) {
            const model = new Model(this.options);
            this.bookshelf = model.bookshelf;
            this.models = model.getModels();
            this.model = model => {
                if (qingful.models[model]) {
                    return qingful.models[model];
                } else {
                    return (qingful.models[
                        model
                    ] = qingful.bookshelf.Model.extend({
                        tableName: model,
                        hasTimestamps: true
                    }));
                }
            };
            debug("models %O", this.models);
        }

        // hook
        const hook = new Hook(this.options);
        this.hooks = hook.getHooks();
        this.hook = {
            run: (name, ...args) => {
                const fn = qingful.hooks[name];
                if (!fn) {
                    return;
                }
                return fn(...args);
            }
        };
        debug("hooks %O", this.hooks);

        // redis
        if (yn(process.env.REDIS)) {
            this.redis = new Redis().getRedis();
        }

        // router
        this.router = new Router(
            Object.assign(this.options, {
                router: this.options.router
            })
        ).getRouters();
        debug("router %O", this.router);
    }

    /**
     * Use v1
     */
    v1() {
        this.useVersion = true;
        this.Controller = Controller;
    }

    /**
     * Use v2
     */
    v2() {
        this.useVersion = true;
        this.Controller = V1Controller;
    }

    /**
     * Use a koa middleware
     * @param {function} fn - Koa middleware
     */
    use(fn) {
        this.koa.use(fn);
    }

    /**
     * Use a body middleware
     * @description The middleware is finally loaded by default, which can be manually invoked.
     */
    body() {
        // step 2
        this.useBody = true;
        this.koa.use(async (ctx, next) => {
            await koaBody({ multipart: true })(ctx, async () => {
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
     * Use a gogs middleware
     * @description The middleware is loaded before body, which can be manually invoked.
     */
    gogs() {
        if (process.env.GOGS) {
            this.koa.use(async (ctx, next) => {
                const sig = ctx.get("X-Gogs-Signature");
                const event = ctx.get("X-Gogs-Event");
                const id = ctx.get("X-Gogs-Delivery");

                if (sig && event && id) {
                    // gogs signature
                    const buf = await getRawBody(ctx.req);
                    if (sig !== _global.sign(buf)) {
                        throw new Error("Gogs Hook Signature Is Wrong");
                    }
                    if (!typeis(ctx.req, ["application/json"])) {
                        throw new Error(
                            "Gogs Hook Context-Type Must Be application/json"
                        );
                    }

                    // master branch
                    const post = buf.toString()
                        ? JSON.parse(buf.toString())
                        : {};
                    if (post.ref !== "refs/heads/master") {
                        throw new Error("Gogs Hook Must Be Master Branch");
                    }

                    // gogs command
                    const message = post.commits[0].message;
                    if (_.startsWith(message, "@start")) {
                        ctx.body = _global.execCommand(
                            process.env.GOGS_START_COMMAND
                        );
                    }
                    if (_.startsWith(message, "@update")) {
                        ctx.body = _global.execCommand(
                            process.env.GOGS_UPDATE_COMMAND
                        );
                    }
                    if (_.startsWith(message, "@stop")) {
                        ctx.body = _global.execCommand(
                            process.env.GOGS_STOP_COMMAND
                        );
                    }
                } else {
                    await next();
                }
            });
        }
    }

    /**
     * Start a server
     * @returns {Server} http.createServer
     */
    start() {
        // step 3
        if (!this.useGogs) {
            this.gogs();
        }
        if (!this.useBody) {
            this.body();
        }
        if (!this.useVersion) {
            this[this.version]();
        }
        if (!this.useCore) {
            this.core();
        }
        this.koa.use(this.router.routes());
        this.koa.use(this.router.allowedMethods());
        this.koa.use(
            koaStatic(process.env.STATIC_DIR, {
                maxAge: process.env.STATIC_MAXAGE,
                dynamic: process.env.STATIC_DYNAMIC
            })
        );

        // context
        Object.assign(this.koa.context, qingful);

        return (this.server = this.koa.listen(
            process.env.APP_PORT,
            this.started
        ));
    }

    started() {
        console.log(`[qingful] Version: ${pkg.version}`);
        console.log(`[qingful] Website: ${process.env.APP_HOST}`);
        console.log(`[qingful] Nodejs Version: ${process.version}`);
        console.log(
            `[qingful] Nodejs Platform: ${process.platform} ${process.arch}`
        );
        console.log(
            `[qingful] Server Enviroment: ${process.env.NODE_ENV ||
                "development"}`
        );
        console.log(
            `[qingful] Server Startup Time: ${moment().diff(
                qingful.start_at
            )}ms`
        );
        console.log(
            `[qingful] Server Current Time: ${moment().format(
                "YYYY-MM-DD HH:mm:ss"
            )}`
        );
        console.log(
            `[qingful] Server Running At: http://127.0.0.1:${
                process.env.APP_PORT
            }`
        );
    }
}

module.exports = Qingful;
