const { ding } = require("./../global");
const yn = require("yn");

function notify(err) {
    console.error(err);
    if (yn(process.env.DINGDING)) {
        if (typeof err === "string") {
            ding(err);
        }

        if (err instanceof Error) {
            ding(`${err.name} - ${err.message}`, err.stack);
        }
    }
}

// 捕获promise reject错误
process.on("unhandledRejection", (reason, promise) => {
    notify(reason);
});

// 捕获未知错误
process.on("uncaughtException", err => {
    notify(err);

    if (err.message.indexOf(" EADDRINUSE ") > -1) {
        process.exit();
    }
});

module.exports = {
    notify
};
