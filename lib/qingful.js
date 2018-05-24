const Koa = require("koa");
const yn = require("yn");
const path = require("path");
const moment = require("moment");
const KoaRouter = require("koa-router");
const koaLogger = require("koa-logger");
const koaStatic = require("koa-static-cache");
const koaBody = require("koa-body");
const debug = require("debug")("qingful");
const redis = require("redis");
const bluebird = require("bluebird");
const dotenv = require("./dotenv/main");
const Hook = require("./core/hook");
const Model = require("./core/model");
const Router = require("./core/router");
const Redis = require("./core/redis");
const Controller = require("./core/controller");
const V1Controller = require("./core/v1/controller");
const { notifyError } = require("./core/error");
const pkg = require("./../package.json");
const _global = require("./global");

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
        this.v1 = {};
        this.options = options;
        this.notifyError = notifyError;

        this.core();

        // context
        Object.assign(this.koa.context, qingful);

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

    core() {
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
                        hasTimestamps: true,
                        softDelete: true
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
        this.Controller = Controller;
        this.v1.Controller = V1Controller;
        this.router = new Router(
            Object.assign(this.options, {
                router: this.options.router
            })
        ).getRouters();
        debug("router %O", this.router);
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
     * Start a server
     * @returns {Server} http.createServer
     */
    start() {
        // step 3
        if (!this.useBody) {
            this.body();
        }
        this.koa.use(this.router.routes());
        this.koa.use(this.router.allowedMethods());
        this.koa.use(
            koaStatic(process.env.STATIC_DIR, {
                maxAge: process.env.STATIC_MAXAGE,
                dynamic: process.env.STATIC_DYNAMIC
            })
        );

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
