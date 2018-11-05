const path = require("path");
const glob = require("glob");
const yn = require("yn");
const debug = require("debug")("doodoo");
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

function loadModels() {
    const root = process.env.APP_ROOT;
    const rootModels = glob.sync("*/model/**/*.{js,js7}", { cwd: root });
    const models = {};
    for (const model of rootModels) {
        models[
            path.basename(model, path.extname(model))
        ] = require(path.resolve(root, model));
    }
    return models;
}

module.exports = (options = {}) => {
    // mysql
    if (yn(process.env.MYSQL)) {
        const connection = options.mysql || {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            port: process.env.MYSQL_PORT,
            database: process.env.MYSQL_DATABASE,
            charset: process.env.MYSQL_CHARSET
        };
        // global bookshelf
        doodoo.bookshelf = getBookshelf({
            client: "mysql",
            connection: connection
        });
    }

    doodoo.models = loadModels("*/model/**/*.{js,js7}");
    doodoo.model = model => {
        return doodoo.models[model];
    };
    debug("models %O", this.models);
};
