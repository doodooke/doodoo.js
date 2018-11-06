const Doodoo = require("doodoo.js");

const app = new Doodoo();

(async () => {
    app.plugin("core");
    app.plugin(["mysql", "baas", "webhook"]);
    app.plugin("mongoose");
    app.route();
    app.plugin("nuxt");
    app.plugin("redis");
    app.plugin("dingding", {
        url:
            "https://oapi.dingtalk.com/robot/send?access_token=06731d1807df40927c5f24a05ad8a6035fc98daec06b01e5ad766404e74a34e1"
    });
    await app.start();

    console.log(doodoo.router);
    console.log(doodoo.models);
})();
