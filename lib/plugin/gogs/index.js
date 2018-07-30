const getRawBody = require("raw-body");
const typeis = require("type-is");
const _global = require("./../../global");

module.exports = qingful => {
    if (process.env.GOGS) {
        qingful.use(async (ctx, next) => {
            const sig = ctx.get("X-Gogs-Signature");
            const event = ctx.get("X-Gogs-Event");
            const id = ctx.get("X-Gogs-Delivery");

            if (sig && event && id) {
                // gogs signature
                const buf = await getRawBody(ctx.req);
                if (sig !== _global.sign(buf)) {
                    throw new Error("Gogs Hook Signature Is Wrong");
                }
                if (!typeis(ctx.req, ["application/json"])) {
                    throw new Error(
                        "Gogs Hook Context-Type Must Be application/json"
                    );
                }

                // master branch
                const post = buf.toString() ? JSON.parse(buf.toString()) : {};
                if (post.ref !== "refs/heads/master") {
                    throw new Error("Gogs Hook Must Be Master Branch");
                }

                // gogs command
                const message = post.commits[0].message;
                if (message.indexOf("@pull") !== -1) {
                    await _global.execCommand(process.env.GOGS_COMMAND_PULL);
                }
                if (message.indexOf("@yarn") !== -1) {
                    await _global.execCommand(process.env.GOGS_COMMAND_YARN);
                }
                if (message.indexOf("@start") !== -1) {
                    await _global.execCommand(process.env.GOGS_COMMAND_START);
                }
                if (message.indexOf("@restart") !== -1) {
                    await _global.execCommand(process.env.GOGS_COMMAND_RESTART);
                }
                if (message.indexOf("@stop") !== -1) {
                    await _global.execCommand(process.env.GOGS_COMMAND_STOP);
                }
                ctx.body = {
                    errmsg: "ok",
                    errcode: 0
                };
            } else {
                await next();
            }
        });
    }
};
