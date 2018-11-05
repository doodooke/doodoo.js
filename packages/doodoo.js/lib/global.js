const prompts = require("prompts");
const shell = require("shelljs");

/**
 * require plugin
 * @param {*} name
 */
async function requirePlugin(name, options = {}) {
    options = Object.assign(
        {
            prefix: "@doodoo/"
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
    requirePlugin,
    expressMiddlewareToKoaMiddleware
};
