const prompts = require("prompts");
const shell = require("shelljs");
const path = require("path");
const _ = require("lodash");

/**
 * Use a plugin
 * @param {*} plugin
 * @param {*} options
 */
async function usePlugin(plugin, options) {
    if (_.isString(plugin)) {
        let required;
        try {
            required = require("./plugin/" + plugin);
        } catch (e) {
            if (e.code !== "MODULE_NOT_FOUND") {
                throw e;
            }

            try {
                required = require(path.resolve("./plugin/" + plugin));
            } catch (e) {
                if (e.code !== "MODULE_NOT_FOUND") {
                    throw e;
                }

                required = await requirePlugin(plugin);
            }
        }
        if (_.isFunction(required)) {
            await required(options);
        }
    }
    if (_.isFunction(plugin)) {
        await plugin(options);
    }
    if (_.isArray(plugin)) {
        for (const key in plugin) {
            await usePlugin(plugin[key], options);
        }
    }
}
/**
 * require plugin
 * @param {*} name
 */
async function requirePlugin(name, options = {}) {
    options = Object.assign(
        {
            prefix: "doodoo-plugin-"
        },
        options
    );
    name = `${options.prefix}${name}`;

    try {
        const required = require(name);
        return required;
    } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") {
            throw e;
        }

        const response = await prompts({
            type: "select",
            name: "npmClient",
            message: "Installing a plugin using yarn, npm or cnpm?",
            choices: [
                { title: "yarn", value: "yarn" },
                { title: "npm", value: "npm" },
                { title: "cnpm", value: "cnpm" }
            ],
            initial: 0
        });

        if (response.npmClient === "yarn") {
            shell.exec(`yarn add ${name}`);
        }
        if (response.npmClient === "npm") {
            shell.exec(`npm install ${name} --save`);
        }
        if (response.npmClient === "cnpm") {
            shell.exec(`cnpm install ${name} --save`);
        }

        return require(name);
    }
}

/**
 * Parase express middleware to koa middleware
 * @param fn
 * @returns {Function}
 */
function expressMiddlewareToKoaMiddleware(fn) {
    return function(ctx, next) {
        if (fn.length < 3) {
            fn(ctx.req, ctx.res);
            return next();
        } else {
            return new Promise((resolve, reject) => {
                fn(ctx.req, ctx.res, err => {
                    if (err) reject(err);
                    else resolve(next());
                });
            });
        }
    };
}

/**
 * get env
 * @param {*} name
 */
function getEnv(name) {
    return process.env[name];
}

module.exports = {
    getEnv,
    usePlugin,
    requirePlugin,
    expressMiddlewareToKoaMiddleware
};
