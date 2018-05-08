const yn = require("yn");
const Koa = require("koa");
const path = require("path");
const moment = require("moment");
const KoaRouter = require("koa-router");
const koaLogger = require("koa-logger");
const koaStatic = require("koa-static-cache");
const koaBody = require("koa-body");
const redis = require("redis");
const bluebird = require("bluebird");
const dotenv = require("./dotenv/main");
const Hook = require("./core/hook");
const Model = require("./core/model");
const Router = require("./core/router");
const Redis = require("./core/redis");
const controller = require("./core/controller");
const { notify } = require("./core/error");
const pkg = require("./../package.json");
const _global = require("./global");

// 加载配置
dotenv.config({
    path: path.resolve(__dirname, "..", ".env")
});
dotenv.config();

// 全局加载
global.qingful = _global;

module.exports = class Qingful {
    constructor(options = {}) {
        // 加载全局变量
        qingful = this;
        Object.assign(qingful, _global);

        this.koa = new Koa();
        this.useBody = false;
        this.options = options;

        this.core();

        // context
        Object.assign(this.koa.context, qingful);

        // error
        this.koa.on("error", notify);

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
            const model = new Model();
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
        }

        // hook
        const hook = new Hook();
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

        // redis
        if (yn(process.env.REDIS)) {
            this.redis = new Redis().getRedis();
        }

        // router
        this.controller = controller;
        this.router = new Router({
            router: this.options.router
        }).getRouters();
    }

    use(fn) {
        this.koa.use(fn);
    }

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
        const now = moment().format("YYYY-MM-DD HH:mm:ss");
        console.log(`[${now}] [INFO] - Version: ${pkg.version}`);
        console.log(`[${now}] [INFO] - Website: ${process.env.APP_HOST}`);
        console.log(`[${now}] [INFO] - Nodejs Version: ${process.version}`);
        console.log(
            `[${now}] [INFO] - Nodejs Platform: ${process.platform} ${
                process.arch
            }`
        );
        console.log(
            `[${now}] [INFO] - Server Enviroment: ${process.env.NODE_ENV ||
                "development"}`
        );
        console.log(
            `[${now}] [INFO] - Server Running At: http://127.0.0.1:${
                process.env.APP_PORT
            }`
        );
    }
};
