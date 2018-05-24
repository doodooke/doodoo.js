const { gitCreateIssue } = require("./../global");
const yn = require("yn");

function notifyError(err, ctx) {
    console.error(err);
    if (yn(process.env.GIT_ISSUE)) {
        if (err instanceof Error) {
            let url, header;
            if (ctx) {
                url = `Url: ${ctx.method} ${ctx.url} ${ctx.status}`;
                header = `Headers: ${JSON.stringify(ctx.headers)}`;
            }

            gitCreateIssue(
                `${err.name} - ${err.message}`,
                `
    ${url}    
    ${header} 

    ${err.stack}  
            `
            );
        }

        if (typeof err === "string") {
            gitCreateIssue(err);
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
