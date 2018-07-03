const fs = require("fs");
const path = require("path");
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

    isGet() {
        if (this.ctx.method === "GET") {
            return true;
        }
        return false;
    }

    isPost() {
        if (this.ctx.method === "POST") {
            return true;
        }
        return false;
    }

    isAjax() {
        return this.ctx.get("X-Requested-With") === "XMLHttpRequest";
    }

    isPjax() {
        return this.ctx.get("X-PJAX") || false;
    }

    isMethod(method) {
        return this.ctx.method === method.toUpperCase();
    }

    view(data) {
        this.ctx.body = data;
    }

    json(data, msg, code) {
        this.view({
            data: data,
            msg: msg,
            code: code
        });
    }

    success(data) {
        this.view({ errmsg: "ok", errcode: 0, data: data });
    }

    fail(errmsg = "error", errcode = 1) {
        this.view({ errmsg: errmsg, errcode: errcode });
    }

    download(file) {
        const filename = path.relative(path.dirname(file), file);

        this.ctx.set("Content-disposition", "attachment; filename=" + filename);
        this.view(fs.createReadStream(file));
    }
};
