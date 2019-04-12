const mongoose = require("mongoose");
const glob = require("glob");
const path = require("path");
const debug = require("debug");

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
    // mongodb
    options.mongoose = options.mongoose ? options.mongoose : {};
    doodoo.mongodb = mongoose.connect(
        options.mongoose.uri || doodoo.getConf("mongoose.uri"),
        options.mongoose.options || { useNewUrlParser: true }
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
