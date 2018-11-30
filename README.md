## Doodoo.js

[![license](https://img.shields.io/github/license/doodooke/doodoo.js.svg?style=flat-square)](http://www.doodooke.com)
[![travis-ci](https://img.shields.io/travis/doodooke/doodoo.js.svg?style=flat-square)](https://travis-ci.org/doodooke/doodoo.js)
[![Dependency Status](https://img.shields.io/david/doodooke/doodoo.js.svg?style=flat-square)](https://david-dm.org/doodooke/doodoo.js)

Doodoo.js -- 中文最佳实践Node.js Web快速开发框架，支持Koa.js, Express.js中间件。

```javascript
//base controller, app/demo/controller/base.js
module.exports = class extends doodoo.Controller {

    async _initialize() {
        console.log('base _initialize');
    }

    async isLogin() {
        console.log('base isLogin');
    }
}

//index controller, app/demo/controller/index.js
const base = require('./base');
module.exports = class extends base {

    async _initialize() {
        await super._initialize();
    }

    async index() {
        this.success("Hello Doodoo.js");
    }

    async index2() {
        this.fail("Hello Doodoo.js");
    }
}
```
环境要求：Node.js >= 7.6.0


## 特性

* 支持koa全部中间件
* 支持使用 ES6+ 全部特性来开发项目
* 支持断点调试 ES6+ 项目
* 支持多种项目结构和多种项目环境
* 支持 Route, Controller 中使用Koa.js的所有API
* 支持多级 Controller
* 支持模块化开发
* 支持钩子机制
* 支持插件机制
* 支持错误处理
* 支持全局 doodoo 变量
* 支持 mysql, mongodb 数据库
* 支持前置，后置操作
* 支持 Restful 设计
* 支持启动自定义
* 支持环境加载配置
* ...

## 安装

```sh
yarn add doodoo.js
```

## 创建启动文件

```javascript
// app/index.js启动文件
const Doodoo = require('doodoo.js');

// 初始化项目
const app = new Doodoo();

// 启动项目
app.start();
```

## 方法

ctx上的函数或参数将自动加载到controller，例如支持 `this.body = 'Hello World!'`, ctx中具体的API请参考Koa.js, controller中的扩展方法如下。

```javascript
this.ctx;
this.next;
this.isGet();
this.isPost();
this.isAjax();
this.isPjax();
this.isMethod(method);
this.hook.run(name, ...args);
this.download(file);
this.view(data);
this.success(errmsg: "ok", errcode: 0, data: data);
this.error(errmsg = "error", errcode = 1);
```

## 配置
```yaml
# 应用配置
app:
  root: app
  port: 3000
  host: "127.0.0.1"
  prefix: ""

# 静态资源服务
static:
  dir: www
  maxAge: 30 * 24 * 60 * 60
  dynamic: true
```

## 其他
```javascript
// 控制器初始化，前置，后置，空操作
async _initialize()
async _before()
async _before_index()
async index()
async _after_index()
async _after()
```


## 开始应用

```sh
// 下载demo
git clone https://github.com/doodooke/doodoo.js.git
// 安装依赖
yarn install
// 进入项目
cd doodoo.js/example
// 启动项目
node app.js
```

## 启动信息

```text
[doodoo] Version: 2.0.0
[doodoo] Website: 127.0.0.1
[doodoo] Nodejs Version: v8.12.0
[doodoo] Nodejs Platform: darwin x64
[doodoo] Server Enviroment: development
[doodoo] Server Startup Time: 212ms
[doodoo] Server Current Time: 2018-08-21 11:17:19
[doodoo] Server Running At: http://127.0.0.1:3000
```


## 使用手册
[Doodoo.js使用手册](https://doodooke.github.io/doodoo.js/index.html)

## 问题反馈
在使用中有任何问题，请使用以下联系方式联系我们

QQ群: 874449168(交流群①)

EMAIL: 786699892@qq.com

Github: https://github.com/doodooke/doodoo.js

## 官网
[多多客Doodooke小程序](http://www.doodooke.com)
