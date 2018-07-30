const fs = require("fs");
const path = require("path");

module.exports = {
    isGet() {
        if (this.method === "GET") {
            return true;
        }
        return false;
    },

    isPost() {
        if (this.method === "POST") {
            return true;
        }
        return false;
    },

    isAjax() {
        return this.get("X-Requested-With") === "XMLHttpRequest";
    },

    isPjax() {
        return this.get("X-PJAX") || false;
    },

    isMethod(method) {
        return this.method === method.toUpperCase();
    },

    view(data) {
        this.body = data;
    },

    json(data, msg, code) {
        this.view({
            data: data,
            msg: msg,
            code: code
        });
    },

    success(data) {
        this.view({ errmsg: "ok", errcode: 0, data: data });
    },

    fail(errmsg = "error", errcode = 1) {
        this.view({ errmsg: errmsg, errcode: errcode });
    },

    download(file) {
        const filename = path.relative(path.dirname(file), file);

        this.set("Content-disposition", "attachment; filename=" + filename);
        this.view(fs.createReadStream(file));
    }
};
