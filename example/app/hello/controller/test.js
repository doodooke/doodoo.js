module.exports = class extends doodoo.Controller {
    async _initialize() {
        // 控制器初始化
        console.log("_initialize");
    }

    async _before() {
        // 控制器前置
        console.log("_before");
    }

    async _before_index() {
        // 方法前置
        console.log("_before_index");
    }

    async index() {
        console.log("index");
        this.success("Hello Doodoo.js");
    }

    async _after_index() {
        // 方法后置
        console.log("_after_index");
    }

    async _after() {
        // 控制器后置
        console.log("_after");
    }
};
