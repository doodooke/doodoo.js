module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: ["prettier"],
    parserOptions: { ecmaVersion: 8 },
    globals: {},
    plugins: ["prettier"],
    rules: {
        "prettier/prettier": "error",
        "no-console": 0, // 禁用 console
        "brace-style": [2, "1tbs"], // 代码书写格式验证
        "camelcase": [2, { "properties": "never" }], // 允许使用驼峰命名法
        // camelcase: 0, // 允许使用驼峰命名法
        eqeqeq: 2, //必须使用全等
        "prefer-arrow-callback": 2, // 要求使用箭头函数作为回调
        "no-var": 2, // 禁用var，用let和const代替
        "prefer-const": 2, // 首选const
        // "indent": [2, 2, { "SwitchCase": 1 }], // 缩进风格
        "no-new-func": 2, // 禁止使用new Function
        "comma-style": 2, // 方数组元素、变量声明等直接需要逗号隔开
        "eol-last": 2, // 代码间间隔出现一行
        "key-spacing": 2, // 键和值前保留一个空格
        "keyword-spacing": 2, // 确保字符前后空格的一致性
        "new-cap": 2, // 构造函数首字母需要大写
        "new-parens": 2, // 没有参数时，构造函数也需要添加括号
        "no-multi-spaces": 2, // 不允许键和值之间存在多个空格
        "no-redeclare": 2, // 不允许重复声明
        "no-return-assign": 2, // 不允许在return语句中任务
        semi: 2, // 语句以分号结尾
        "semi-spacing": 2, // 分号前后不能有空格
        quotes: 2, // 使用双引号
        "space-in-parens": 2, // 不允许在括号里面存在空格
        "space-infix-ops": 2, // 插入符合变量之间需要添加一个空格
        "spaced-comment": 2, // 注释前需要一个空格
        "no-mixed-requires": 2, // 不允许混合requires文件,
        "no-new-require": 2 // 不允许new require出现
    }
};
