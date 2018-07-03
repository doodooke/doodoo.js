const glob = require("glob");
const path = require("path");

module.exports = class Hook {
    constructor(options = {}) {
        this.root = options.root || process.env.APP_ROOT;
        this.hooks = {};
        this.loadHooks();
    }

    async run(name, ...args) {
        const fns = this.hooks[name] || [];
        for (const key in fns) {
            await fns[key](...args);
        }
    }

    async add(name, fn) {
        if (!this.hooks[name]) {
            this.hooks[name] = [fn];
        } else {
            this.hooks[name].push(fn);
        }
    }

    loadHooks() {
        const rootHooks = glob.sync("*/hook/**/*.js", {
            cwd: this.root
        });
        for (const hook of rootHooks) {
            const hooks = require(path.resolve(this.root, hook));
            for (const key in hooks) {
                this.add(key, hooks[key]);
            }
        }
    }
};
