const path = require("path");
const glob = require("glob");
const debug = require("debug")("doodoo");
const _knex = require("knex");
const _bookshelf = require("bookshelf");
const uuid = require("bookshelf-uuid");
const paranoia = require("bookshelf-paranoia");
const model = require("./bookshelf/model");
const pagination = require("./bookshelf/pagination");

/**
 * Get bookshelf
 * @param {object} connection - The connection of postgres
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
    const root = doodoo.getConf("app.root");
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
    // postgres
    const connection = options.postgres || {
        host: doodoo.getConf("postgres.host"),
        user: doodoo.getConf("postgres.user"),
        password: doodoo.getConf("postgres.password"),
        port: doodoo.getConf("postgres.port"),
        database: doodoo.getConf("postgres.database"),
        charset: doodoo.getConf("postgres.charset")
    };
    // global bookshelf
    doodoo.getBookshelf = getBookshelf;
    doodoo.bookshelf = getBookshelf({
        client: "pg",
        connection: connection
    });

    const models = loadModels("*/model/**/*.{js,js7}");
    if (doodoo.models) {
        Object.assign(doodoo.models, models);
    } else {
        doodoo.models = models;
    }

    doodoo.model = model => {
        return doodoo.models[model];
    };
    debug("models %O", this.models);
};
