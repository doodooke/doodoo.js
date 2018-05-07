const Koa = require("koa");
const path = require("path");
const moment = require("moment");
const KoaRouter = require("koa-router");
const KoaLogger = require("koa-logger");
const KoaStatic = require("koa-static-cache");
const KoaBody = require("koa-body");
const redis = require("redis");
const bluebird = require("bluebird");
const dotenv = require("./dotenv/main");
const Hook = require("./core/hook");
const Model = require("./core/model");
const Router = require("./core/router");
const Redis = require("./core/redis");
const controller = require("./core/controller");
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
		global.qingful = this;
		Object.assign(qingful, _global);

		this.koa = new Koa();
		this.options = options;
		this.model = new Model();
		this.bookshelf = this.model.bookshelf;
		this.models = this.model.getModels();
		this.model = model => {
			return qingful.models[model];
		};
		this.hooks = new Hook().getHooks();
		this.redis = new Redis().getRedis();
		this.controller = controller;
		this.router = new Router({
			router: this.options.router
		}).getRouters();

		Object.assign(this.koa.context, qingful);

		// step 1
		this.koa.use(KoaLogger());
		this.koa.use(async function(ctx, next) {
			try {
				await next();
			} catch (err) {
				throw err;
			}
		});
	}

	get on() {
		return this.koa.on;
	}

	get context() {
		return this.koa.context;
	}

	use(fn) {
		this.koa.use(fn);
	}

	body() {
		// step 2
		this.koa.use(async (ctx, next) => {
			await KoaBody({ multipart: true })(ctx, async () => {
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

	async start() {
		if (this.hooks.serverStart) {
			await this.hooks.serverStart();
		}

		// step 3
		this.koa.use(this.router.routes());
		this.koa.use(this.router.allowedMethods());
		this.koa.use(
			KoaStatic(process.env.STATIC_DIR, {
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
