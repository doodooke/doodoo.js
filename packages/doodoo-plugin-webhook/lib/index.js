const crypto = require("crypto");
const getRawBody = require("raw-body");
const typeis = require("type-is");
const shell = require("shelljs");

/**
 * Get sha256 hmac signature
 * @param {String} data data
 * @param {String} secret secret
 */
function signGogs(data, secret) {
    return crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("hex");
}

function signGithub(data, secret) {
    return (
        "sha1=" +
        crypto
            .createHmac("sha1", secret)
            .update(data)
            .digest("hex")
    );
}

async function execMessage(message, cmd = {}) {
    for (const key in cmd) {
        if (message.indexOf(key) !== -1) {
            await shell.exec(cmd[key]);
        }
    }
}

function isMaster(body) {
    if (body.ref !== "refs/heads/master") {
        return false;
    }
    return true;
}

// Usage
// app.plugin("webhook", {
//     secret: "xxx",
//     isMaster: true,
//     cmd: {
//         "@start": "pm2 start pm2.json",
//         "@restart": "pm2 restart pm2.json",
//         "@stop": "pm2 stop pm2.json",
//         "@pull": "git pull",
//         "@install": "yarn install"
//     }
// });
module.exports = options => {
    doodoo.use(async (ctx, next) => {
        let sig, type;

        // gogs
        if (
            ctx.get("X-Gogs-Signature") &&
            ctx.get("X-Gogs-Event") &&
            ctx.get("X-Gogs-Delivery")
        ) {
            type = "gogs";
            sig = ctx.get("X-Gogs-Signature");
        }

        // github
        if (
            ctx.get("X-Hub-Signature") &&
            ctx.get("X-Github-Event") &&
            ctx.get("X-Github-Delivery")
        ) {
            type = "github";
            sig = ctx.get("X-Hub-Signature");
        }

        // gitlab
        if (ctx.get("X-Gitlab-Token") && ctx.get("X-Gitlab-Event")) {
            type = "gitlab";
            event = ctx.get("X-Gitlab-Event");
        }

        // not hook
        if (!type) {
            return await next();
        }

        const buf = await getRawBody(ctx.req);
        if (!typeis(ctx.req, ["application/json"])) {
            throw new Error("Hook Context-Type Must Be application/json");
        }
        const body = buf.toString() ? JSON.parse(buf.toString()) : {};
        if (!body.commits || !body.commits.length) {
            this.fail();
            return;
        }
        const message = body.commits[0].message;
        switch (type) {
            case "gogs":
                if (sig !== signGogs(buf, options.secret)) {
                    throw new Error("Gogs Hook Signature Is Wrong");
                }
                if (options.isMaster) {
                    if (isMaster(body)) {
                        await execMessage(message, options.cmd);
                    }
                } else {
                    await execMessage(message, options.cmd);
                }

                ctx.success();
                break;
            case "github":
                if (sig !== signGithub(buf, options.secret)) {
                    throw new Error("Github Hook Signature Is Wrong");
                }
                if (options.isMaster) {
                    if (isMaster(body)) {
                        await execMessage(message, options.cmd);
                    }
                } else {
                    await execMessage(message, options.cmd);
                }

                ctx.success();
                break;
            case "gitlab":
                const token = ctx.get("X-Gitlab-Token");
                if (token !== options.secret) {
                    throw new Error("Gitlab Hook Token Is Wrong");
                }
                if (options.isMaster) {
                    if (isMaster(body)) {
                        await execMessage(message, options.cmd);
                    }
                } else {
                    await execMessage(message, options.cmd);
                }

                ctx.success();
                break;
        }
    });
};
