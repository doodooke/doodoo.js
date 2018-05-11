module.exports = class extends qingful.Controller {
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

    /**
     * Represents a book.
     * @constructor
     * @param {string} title - The title of the book.
     * @param {string} author - The author of the book.
     */
    async index() {
        console.log("index");
        this.success("Hello Qingful");
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
