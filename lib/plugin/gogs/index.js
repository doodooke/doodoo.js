const crypto = require("crypto");
const getRawBody = require("raw-body");
const typeis = require("type-is");
const { exec } = require("child_process");

/**
 * Get sha256 hmac signature
 * @param {String} data data
 * @param {String} secret secret
 */
function sign(data, secret) {
    return crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("hex");
}

/**
 * Exec command
 * @param {String} command command
 * @param {String} options options
 */
function execCommand(command, options) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    stdout: stdout.toString(),
                    stderr: stderr.toString()
                });
            }
        });
    });
}

/**
 * Uage
 * app.plugin("gogs", {url: "xxx", secret: "xxx", cmd: {
 *    "start": "pm2 start pm2.json",
 *    "restart": "pm2 restart pm2.json",
 *    "stop": "pm2 stop pm2.json",
 *    "pull": "git pull",
 *    "install": "yarn install"
 * }});
 */
module.exports = options => {
    doodoo.use(async (ctx, next) => {
        const sig = ctx.get("X-Gogs-Signature");
        const event = ctx.get("X-Gogs-Event");
        const id = ctx.get("X-Gogs-Delivery");

        if (sig && event && id) {
            // gogs signature
            const buf = await getRawBody(ctx.req);
            if (sig !== sign(buf, options.secret)) {
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
                await execCommand(options.cmd.pull);
            }
            if (message.indexOf("@install") !== -1) {
                await execCommand(options.cmd.install);
            }
            if (message.indexOf("@start") !== -1) {
                await execCommand(options.cmd.start);
            }
            if (message.indexOf("@restart") !== -1) {
                await execCommand(options.cmd.restart);
            }
            if (message.indexOf("@stop") !== -1) {
                await execCommand(options.cmd.stop);
            }
            ctx.success();
        } else {
            await next();
        }
    });
};
