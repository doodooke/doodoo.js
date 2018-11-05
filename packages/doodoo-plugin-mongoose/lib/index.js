const yn = require("yn");
const mongoose = require("mongoose");

module.exports = (options = {}) => {
    // mongodb
    if (yn(process.env.MONGOOSE)) {
        options.mongoose = options.mongoose ? options.mongoose : {};
        doodoo.mongodb = mongoose.connect(
            options.mongoose.uri || process.env.MONGOOSE_URI,
            options.mongoose.options || { useNewUrlParser: true }
        );
    }
};
