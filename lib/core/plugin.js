const glob = require("glob");
const path = require("path");
const _ = require("lodash");

module.exports = class Plugin {
    constructor(options = {}) {
        this.root = options.root || process.env.APP_ROOT;
    }

    loadPlugins() {
        const rootPlugins = glob.sync("*/plugin.js", { cwd: this.root });
        const plugins = {};
        for (const plugin of rootPlugins) {
            plugins[path.dirname(plugin)] = require(path.resolve(
                this.root,
                plugin
            ));
        }
        return plugins;
    }

    usePlugins() {
        // qingful.js plugins
        const inPlugins = glob.sync("./plugin/*", {
            cwd: path.dirname(__dirname)
        });
        for (const plugin of inPlugins) {
            const fn = require(path.resolve(path.dirname(__dirname), plugin));
            if (_.isFunction(fn)) {
                fn(qingful);
            }
        }

        // project plugins
        const outPlugins = glob.sync("./plugin", {
            cwd: this.root
        });
        for (const plugin of outPlugins) {
            const fn = require(path.resolve(this.root, plugin));
            if (_.isFunction(fn)) {
                fn(qingful);
            }
        }
    }
};
