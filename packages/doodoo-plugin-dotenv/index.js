const path = require("path");
const _ = require("lodash");
const dotenv = require("./lib/main");

dotenv.config({
    path: path.resolve(__dirname, ".env")
});
dotenv.config();
dotenv.config({
    path: `${process.env.NODE_ENV}.env`
});

doodoo.config = {};
for (const key in process.env) {
    _.set(doodoo.config, key.split("_"), process.env[key]);
}
doodoo.getConf = path => {
    return _.get(doodoo.config, _.toUpper(path));
};
