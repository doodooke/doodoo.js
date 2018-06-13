const BaseController = require("./../controller");

module.exports = class Controller extends BaseController {
    success(data) {
        this.view({ errmsg: "ok", errcode: 0, data: data });
    }

    fail(errmsg = "error", errcode = 1) {
        this.view({ errmsg: errmsg, errcode: errcode });
    }
};
