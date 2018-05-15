const { gitCreateIssue } = require("./../global");
const yn = require("yn");

function notifyError(err, ...argv) {
    console.error(err);
    if (yn(process.env.GIT_ISSUE)) {
        if (err instanceof Error) {
            gitCreateIssue(`${err.name} - ${err.message}`, err.stack, ...argv);
        }

        if (typeof err === "string") {
            gitCreateIssue(err, ...argv);
        }
    }
}

// 捕获promise reject错误
process.on("unhandledRejection", (reason, promise) => {
    notifyError(reason);
});

// 捕获未知错误
process.on("uncaughtException", err => {
    notifyError(err);

    if (err.message.indexOf(" EADDRINUSE ") > -1) {
        process.exit();
    }
});

module.exports = {
    notifyError
};
