const Doodoo = require("doodoo.js");

const app = new Doodoo();

(async () => {
    await app.plugin("core");
    await app.plugin(["mysql", "baas", "webhook"]);
    await app.plugin("mongoose");
    await app.route();
    await app.plugin("nuxt");
    await app.plugin("redis");
    await app.plugin("dingding", {
        url:
            "https://oapi.dingtalk.com/robot/send?access_token=06731d1807df40927c5f24a05ad8a6035fc98daec06b01e5ad766404e74a34e1"
    });
    await app.start();

    doodoo.middleware.forEach(m => {
        console.log(m.name);
    });

    // doodoo.hook.run("dingding", "1", "2");

    // console.log(doodoo.router);
    // console.log(doodoo.models);
})();
