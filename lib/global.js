const _knex = require("knex");
const _bookshelf = require("bookshelf");
const uuid = require("bookshelf-uuid");
const paranoia = require("bookshelf-paranoia");
const model = require("./bookshelf/model");
const pagination = require("./bookshelf/pagination");

/**
 * Get bookshelf
 * @param {object} connection - The connection of mysql
 * @returns bookshelf
 */
function getBookshelf(connection) {
    const knex = _knex(connection);
    const bookshelf = _bookshelf(knex);

    bookshelf.plugin("visibility");
    bookshelf.plugin(pagination);
    bookshelf.plugin(paranoia);
    bookshelf.plugin(uuid);
    bookshelf.plugin(model);

    return bookshelf;
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
    getBookshelf,
    expressMiddlewareToKoaMiddleware
};
