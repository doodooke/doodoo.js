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
 * @private
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
        this.prefix = process.env.APP_PREFIX;

        assert(this.router instanceof KoaRouter);
    }

    loadRouters() {
        const controllers = glob.sync("*/controller/**/*.{js,js7}", {
            cwd: this.root
        });
        for (const controller of controllers) {
            const paths = path.parse(controller);
            const Ctrl = require(path.resolve(this.root, controller));
            if (Ctrl instanceof KoaRouter) {
                this.router.use(
                    path
                        .join(this.prefix, paths.dir, paths.name)
                        .replace(/\\/g, "/")
                        .replace(/\/controller/, ""),
                    Ctrl.routes()
                );
                continue;
            }
            if (!isClass(Ctrl)) {
                continue;
            }

            const methods = Object.getOwnPropertyNames(Ctrl.prototype);
            const layers = [];
            for (const method of methods) {
                if (_.startsWith(method, "_") || method === "constructor") {
                    continue;
                }

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

            for (const layer of layers) {
                const layerPath = path
                    .join(this.prefix, paths.dir, paths.name, layer.method)
                    .replace(/\\/g, "/")
                    .replace(/\/controller/, "");
                this.router.all(layerPath, layer.callback);
            }
        }
        return this.router;
    }
};
