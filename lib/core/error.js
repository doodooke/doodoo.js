const { ding } = require("./../global");
const yn = require("yn");

function dingError(err, ...argv) {
    console.error(err);
    if (yn(process.env.DINGDING)) {
        if (typeof err === "string") {
            ding(err, ...argv);
        }

        if (err instanceof Error) {
            ding(`${err.name} - ${err.message}`, err.stack, ...argv);
        }
    }
}

// 捕获promise reject错误
process.on("unhandledRejection", (reason, promise) => {
    dingError(reason);
});

// 捕获未知错误
process.on("uncaughtException", err => {
    dingError(err);

    if (err.message.indexOf(" EADDRINUSE ") > -1) {
        process.exit();
    }
});

module.exports = {
    dingError
};
