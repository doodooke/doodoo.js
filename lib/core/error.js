const _ = require("lodash");

function notifyError(err, ctx) {
    console.error(err);
    doodoo.hook.run("createIssue", err, ctx);
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
