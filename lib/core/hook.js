const glob = require("glob");
const path = require("path");

module.exports = class Hook {
    constructor(options = {}) {
        this.root = options.root || process.env.APP_ROOT;
    }

    getHooks() {
        const root = path.join(this.root, "hook");
        const rootHooks = glob.sync("**/*.js", { cwd: root });
        const hooks = {};
        for (const hook of rootHooks) {
            hooks[path.basename(hook, ".js")] = require(path.resolve(
                root,
                hook
            ));
        }
        return hooks;
    }
};
