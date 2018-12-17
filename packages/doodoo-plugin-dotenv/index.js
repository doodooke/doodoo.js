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

doodoo.getConf = path => {
    return _.get(process.env, _.toUpper(path).replace(".", "_"));
};
