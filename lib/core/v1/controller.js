const fs = require("fs");
const path = require("path");
const assert = require("assert");
const BaseController = require("./../controller");

module.exports = class Controller extends BaseController {
    success(data) {
        this.view({ errcode: 0, errmsg: "ok", data: data });
    }

    fail(errcode = 1, errmsg = "error") {
        this.view({ errcode: errcode, errmsg: errmsg });
    }
};
