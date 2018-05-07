const path = require("path");
const glob = require("glob");
const _ = require("lodash");
const assert = require("assert");
const KoaRouter = require("koa-router");

/**
 * Returns true if the input value is an es2015 `class`.
 * @param {*} - the input to test
 * @returns {boolean}
 * @static
 */
function isClass(input) {
	if (_.isFunction(input)) {
		return /^class /.test(Function.prototype.toString.call(input));
	} else {
		return false;
	}
}

module.exports = class Router {
	constructor(options = {}) {
		this.root = options.root || process.env.APP_ROOT;
		this.router = options.router || new KoaRouter();

		assert(this.router instanceof KoaRouter);
	}

	getRouters() {
		const root = path.join(this.root, "controller");
		const controllers = glob.sync("**/*.js", { cwd: root });
		for (const controller of controllers) {
			const Ctrl = require(path.resolve(root, controller));
			if (!isClass(Ctrl)) {
				continue;
			}

			const methods = Object.getOwnPropertyNames(Ctrl.prototype);
			const layers = [];
			const validMethods = [];
			for (const method of methods) {
				if (!_.startsWith(method, "_") && method !== "constructor") {
					validMethods.push(method);
				}
			}

			for (const method of validMethods) {
				layers.push({
					method: method,
					callback: async (ctx, next) => {
						const ctrl = new Ctrl(ctx, next);
						const runMethods = [
							"_init",
							"_initialize",
							"_before",
							`_before_${method}`,
							method,
							`_after_${method}`,
							"_after"
						];

						for (const method of runMethods) {
							if (_.includes(methods, method)) {
								await ctrl[method]();
							}

							if (ctx.status !== 404) {
								break;
							}
						}
					}
				});
			}

			const paths = path.parse(controller);
			for (const layer of layers) {
				this.router.all(
					path
						.join("/", paths.dir, paths.name, layer.method)
						.replace(/\\/g, "/"),
					layer.callback
				);
			}
		}
		return this.router;
	}
};
