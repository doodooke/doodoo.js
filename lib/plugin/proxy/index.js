const httpProxy = require("http-proxy");

const hProxy = httpProxy.createProxyServer({});
hProxy.on("error", (err, req, res) => {
    console.error(err);
    if (req.headers.upgrade && req.headers.upgrade === "websocket") {
        return;
    }
    res.writeHead(500, {
        "Content-Type": "application/json; charset=utf-8"
    });
    res.end(
        `{ "errmsg": "${err.name + " : " + err.message}", "errcode": "1" }`
    );
});

qingful.hook.add("started", () => {
    qingful.server.on("upgrade", (req, socket, head) => {
        hProxy.ws(req, socket, head);
    });
});

module.exports = options => {
    qingful.use(async (ctx, next) => {
        const proxyTarget = ctx.get("Proxy") || ctx.query.Proxy;
        const proxyChangeOrigin =
            ctx.get("ProxyChangeOrigin") === "false" ? false : true;
        const proxyIgnorePath =
            ctx.get("ProxyIgnorePath") === "false" ? false : true;
        if (proxyTarget) {
            ctx.respond = false;
            return hProxy.web(ctx.req, ctx.res, {
                target: proxyTarget,
                changeOrigin: proxyChangeOrigin,
                ignorePath: proxyIgnorePath
            });
        } else {
            await next();
        }
    });
};
