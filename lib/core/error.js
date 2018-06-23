const { createIssue } = require("./../global");

function notifyError(err, ctx) {
    console.error(err);
    if (err instanceof Error) {
        let url = "",
            body = "",
            header = "",
            stack = "";
        if (ctx) {
            url = `Url: ${ctx.method} ${ctx.url} ${ctx.status}`;
            body = `Body: ${JSON.stringify(ctx.request.body)}`;
            header = `Headers: ${JSON.stringify(ctx.headers)}`;

            if (ctx.method === "POST") {
                stack = `
    ${url}
    ${body}    
    ${header} 

    ${err.stack}  
            `;
            } else {
                stack = `
    ${url}
    ${header} 

    ${err.stack}  
            `;
            }
        }

        createIssue(`${err.name} - ${err.message}`, stack);
    }

    if (typeof err === "string") {
        createIssue(err);
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
