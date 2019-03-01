const chokidar = require("chokidar");
const decache = require("decache");
const _ = require("lodash");
const _path = require("path");
const KoaRouter = require("koa-router");

if (!global.doodoo) {
    global.doodoo = {};
}

doodoo.watcher = chokidar.watch("app/**/*.{js,js7}", {
    ignored: /(^|[\/\\])\../,
    ignored: function(path, stats) {
        return (
            /(^|[\/\\])\../.test(path) ||
            /node_modules/.test(path) ||
            /plugin.js/.test(path)
        );
    },
    persistent: true,
    ignoreInitial: true
});

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
function isController(path) {
    return _.includes(_.split(path, "/"), "controller");
}
function isModel(path) {
    return _.includes(_.split(path, "/"), "model");
}
function isHook(path) {
    return /hook.js/.test(path);
}

doodoo.watcher
    .on("ready", () => console.log("[doodoo] Waiting for file changes !!!"))
    .on("add", path => {
        console.log(`File ${path} has been added`);

        // 控制器
        if (isController(path)) {
            const paths = _path.parse(path);
            paths.dir = _.split(paths.dir, "/");
            paths.dir.shift();
            paths.dir = paths.dir.join("/");

            const Ctrl = require(_path.resolve(path));
            if (
                Ctrl instanceof KoaRouter ||
                _.isEqual(
                    Object.keys(Ctrl.__proto__),
                    Object.keys(KoaRouter.prototype)
                )
            ) {
                // 添加新的
                doodoo.router.use(
                    _path
                        .join("/", paths.dir, paths.name)
                        .replace(/\\/g, "/")
                        .replace(/\/controller/, ""),
                    Ctrl.routes()
                );
                return;
            }
            if (!isClass(Ctrl)) {
                return;
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
                const layerPath = _path
                    .join("/", paths.dir, paths.name, layer.method)
                    .replace(/\\/g, "/")
                    .replace(/\/controller/, "");
                // 添加新的
                doodoo.router.all(layerPath, layer.callback);
            }
        }

        // 模型
        if (isModel(path)) {
            doodoo.models[
                _path.basename(path, _path.extname(path))
            ] = require(_path.resolve(path));
        }

        // 钩子
        if (isHook(path)) {
            doodoo.hook = new doodoo.Hook();
        }
    })
    .on("change", path => {
        console.log(`File ${path} has been changed`);

        // 移除require缓存
        decache(path);
        decache(_path.resolve(path));

        // 控制器
        if (isController(path)) {
            const paths = _path.parse(path);
            paths.dir = _.split(paths.dir, "/");
            paths.dir.shift();
            paths.dir = paths.dir.join("/");

            const Ctrl = require(_path.resolve(path));
            if (
                Ctrl instanceof KoaRouter ||
                _.isEqual(
                    Object.keys(Ctrl.__proto__),
                    Object.keys(KoaRouter.prototype)
                )
            ) {
                // 移除旧的
                for (const layer of Ctrl.routes().router.stack) {
                    _.remove(doodoo.router.stack, o => {
                        return (
                            o.path ===
                            doodoo.getConf("app.prefix") +
                                _path
                                    .join("/", paths.dir, paths.name)
                                    .replace(/\\/g, "/")
                                    .replace(/\/controller/, "") +
                                layer.path
                        );
                    });
                }
                // 添加新的
                doodoo.router.use(
                    _path
                        .join("/", paths.dir, paths.name)
                        .replace(/\\/g, "/")
                        .replace(/\/controller/, ""),
                    Ctrl.routes()
                );
                return;
            }
            if (!isClass(Ctrl)) {
                return;
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
                const layerPath = _path
                    .join("/", paths.dir, paths.name, layer.method)
                    .replace(/\\/g, "/")
                    .replace(/\/controller/, "");

                // 移除旧的
                _.remove(doodoo.router.stack, o => {
                    return o.path === doodoo.getConf("app.prefix") + layerPath;
                });

                // 添加新的
                doodoo.router.all(layerPath, layer.callback);
            }
        }

        // 模型
        if (isModel(path)) {
            doodoo.models[
                _path.basename(path, _path.extname(path))
            ] = require(_path.resolve(path));
        }

        // 钩子
        if (isHook(path)) {
            doodoo.hook = new doodoo.Hook();
        }
    })
    .on("unlink", path => {
        console.log(`File ${path} has been removed`);

        // 移除require缓存
        decache(path);
        decache(_path.resolve(path));

        // 控制器
        if (isController(path)) {
            const paths = _path.parse(path);
            paths.dir = _.split(paths.dir, "/");
            paths.dir.shift();
            paths.dir = paths.dir.join("/");

            const Ctrl = require(_path.resolve(path));
            if (
                Ctrl instanceof KoaRouter ||
                _.isEqual(
                    Object.keys(Ctrl.__proto__),
                    Object.keys(KoaRouter.prototype)
                )
            ) {
                // 移除旧的
                for (const layer of Ctrl.routes().router.stack) {
                    _.remove(doodoo.router.stack, o => {
                        return o.path === layer.path;
                    });
                }
                return;
            }
            if (!isClass(Ctrl)) {
                return;
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
                const layerPath = _path
                    .join("/", paths.dir, paths.name, layer.method)
                    .replace(/\\/g, "/")
                    .replace(/\/controller/, "");

                // 移除旧的
                _.remove(doodoo.router.stack, o => {
                    return o.path === doodoo.getConf("app.prefix") + layerPath;
                });
            }
        }

        // 模型
        if (isModel(path)) {
            delete doodoo.models[_path.basename(path, _path.extname(path))];
        }

        // 钩子
        if (isHook(path)) {
            doodoo.hook = new doodoo.Hook();
        }
    });
