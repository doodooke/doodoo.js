const glob = require("glob");
const path = require("path");
const yn = require("yn");
const mongoose = require("mongoose");
const { getBookshelf } = require("./../global");

module.exports = class Model {
    constructor(options = {}) {
        this.root = options.root || process.env.APP_ROOT;

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

        // mongodb
        if (yn(process.env.MONGOOSE)) {
            options.mongoose = options.mongoose ? options.mongoose : {};
            doodoo.mongodb = mongoose.connect(
                options.mongoose.uri || process.env.MONGOOSE_URI,
                options.mongoose.options || { useNewUrlParser: true }
            );
        }
    }

    loadModels() {
        const rootModels = glob.sync("*/model/**/*.{js,js7}", {
            cwd: this.root
        });
        const models = {};
        for (const model of rootModels) {
            models[
                path.basename(model, path.extname(model))
            ] = require(path.resolve(this.root, model));
        }
        return models;
    }
};
