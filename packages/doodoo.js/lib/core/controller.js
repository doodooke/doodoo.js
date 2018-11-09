const _ = require("lodash");
const assert = require("assert");

module.exports = class Controller {
    constructor(ctx, next) {
        assert(ctx, "SyntaxError: Missing Super(ctx) Call In Constructor");
        assert(next, "SyntaxError: Missing Super(next) Call In Constructor");

        this.ctx = ctx;
        this.next = next;

        for (const name in ctx) {
            if (this[name]) {
                console.warn(
                    `SyntaxTips: Using "this.koa.${name}()" To Call Koa ${_.capitalize(
                        name
                    )} Api`
                );
                continue;
            }

            if (typeof ctx[name] !== "function") {
                Object.defineProperty(this, name, {
                    get: () => {
                        return this.ctx[name];
                    },
                    set: value => {
                        this.ctx[name] = value;
                    }
                });
            } else {
                this[name] = ctx[name];
            }
        }
    }
};
