const path = require("path");
const glob = require("glob");
const debug = require("debug")("doodoo");
const Sequelize = require("sequelize");

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
    // global sequelize
    doodoo.sequelize = new Sequelize(
        options.mysql || {
            dialect: doodoo.getConf("mysql.dialect"),
            host: doodoo.getConf("mysql.host"),
            username: doodoo.getConf("mysql.username"),
            password: doodoo.getConf("mysql.password"),
            port: doodoo.getConf("mysql.port"),
            database: doodoo.getConf("mysql.database"),
            charset: doodoo.getConf("mysql.charset")
        }
    );

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
