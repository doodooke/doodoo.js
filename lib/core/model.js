const glob = require("glob");
const path = require("path");
const _ = require("lodash");
const { getBookshelf } = require("./../global");

module.exports = class Model {
    constructor(options = {}) {
        this.root = options.root || process.env.APP_ROOT;
        this.addonRoot = options.addonRoot || process.env.ADDON_ROOT;
        this.connection = options.mysql || {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            port: process.env.MYSQL_PORT,
            database: process.env.MYSQL_DATABASE,
            charset: process.env.MYSQL_CHARSET
        };
        this.bookshelf = getBookshelf({
            client: "mysql",
            connection: this.connection
        });
    }

    getModels() {
        return _.merge(
            this.getPatternModels("*/model/**/*.js", this.addonRoot),
            this.getPatternModels()
        );
    }

    getPatternModels(pattern = "model/**/*.js", root = this.root) {
        const rootModels = glob.sync(pattern, { cwd: root });
        const models = {};
        for (const model of rootModels) {
            models[path.basename(model, ".js")] = require(path.resolve(
                root,
                model
            ));
        }
        return models;
    }
};
