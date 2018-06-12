const glob = require("glob");
const path = require("path");
const _ = require("lodash");

module.exports = class Hook {
    constructor(options = {}) {
        this.root = options.root || process.env.APP_ROOT;
        this.addonRoot = options.addonRoot || process.env.ADDON_ROOT;
    }

    getHooks() {
        return _.merge(
            this.getPatternHooks("*/hook/**/*.js", this.addonRoot),
            this.getPatternHooks()
        );
    }

    getPatternHooks(pattern = "hook/**/*.js", root = this.root) {
        const rootHooks = glob.sync(pattern, { cwd: root });
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
