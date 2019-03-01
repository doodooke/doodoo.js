## 快速入门

### 介绍

#### 简介

​	Doodoo.js -- 中文最佳实践Node.js快速开发框架。支持Koa.js, Express.js中间件，支持模块机制，插件机制，钩子机制，让开发 Node.js 项目更加简单、高效、灵活。

#### 特性

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

#### 安装

环境要求：node >= 8.0.0
```javascript
//npm
npm install doodoo.js --save
//yarn
yarn add doodoo.js
```

#### 使用 ES6/7 特性来开发项目

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

#### 详细的日志

##### 服务 启动日志

```
[doodoo] Version: 2.0.0
[doodoo] Website: 127.0.0.1
[doodoo] Nodejs Version: v8.12.0
[doodoo] Nodejs Platform: darwin x64
[doodoo] Server Enviroment: development
[doodoo] Server Startup Time: 212ms
[doodoo] Server Current Time: 2018-08-21 11:17:19
[doodoo] Server Running At: http://127.0.0.1:3000
```

##### HTTP 请求日志

```
<-- GET /demo/index/index
--> GET /demo/index/index 200 4ms 
```

### 创建项目

#### async/await
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

#### 启动项目

在项目目录下执行命令 `node app.js`，如果能看到类似下面的内容，表示服务启动成功。

```
[doodoo] Version: 2.0.0
[doodoo] Website: 127.0.0.1
[doodoo] Nodejs Version: v8.12.0
[doodoo] Nodejs Platform: darwin x64
[doodoo] Server Enviroment: development
[doodoo] Server Startup Time: 212ms
[doodoo] Server Current Time: 2018-08-21 11:17:19
[doodoo] Server Running At: http://127.0.0.1:3000
```



### 项目结构

```

   |-- app
   |   |-- demo
   |   |   |-- controller
   |   |   |   |-- home
   |   |   |   |   |-- index.js
   |   |   |   |   `-- base.js
   |   |   |   |-- admin
   |   |   |-- model
   |   |   |-- hook.js
   |-- logs
   |-- node_modules
   |-- www
   |-- app.js
   |-- package.json
   
```

#### app

源代码目录

#### app/demo/controller

模块控制器目录

#### app/demo/model

模块模型目录

#### app/demo/hook.js

模块钩子文件

#### www

静态文件目录，存放图片，样式等文件的目录

#### app.js

项目启动入口文件



### 代码规范

#### 大小写规范

doodoo.js无伦是文件名还是控制器都默认区分大小写，很多在 `Windows` 下开发项目不区分大小写，所以如果服务器环境是 `Linux` 要特别注意。

#### 使用ES6语法

ES6 中有大量的语法糖可以简化我们的代码，让代码更加简洁高效。 Node.js 最新版本已经较好的支持了 ES6 的语法，即使有些语法不支持，也可以通过 Babel 编译来支持。

#### constructor 方法

控制器 `constructor` 方法请尽量不要使用，推荐使用 `_initialize` ，如果需要使用，必须调用 `super`

```javascript
module.exports = class doodoo.Controller {
    constructor(ctx, next) {
        super(ctx, next);
    }
}
```

#### 使用 async/await

`async/await` 是nodejs异步最终解决方案



### 常见问题

#### 如何修改服务监听的端口

默认情况下，Node.js 服务监听的端口为 `3000`，如果需要修改的话，可以通过修改配置文件`config.yml` 来修改，如：

```yml
app:
  port: 3000
```

#### 并行处理

使用 `async/await` 来处理异步时，是串行执行的。但很多场景下我们需要并行处理，这样可以大大提高执行效率，此时可以结合 `Promise.all` 来处理。

```javascript
module.exports = class extends doodoo.Controller {
    async index() {
        let d1 = this.getData1();
        let d2 = this.getData2();
        let [d1Data, d2Data] = await Promise.all([d1, d2]);
    }
}
```

#### 如何输出图片

项目中有时候要输出图片等类型的数据，可以通过下面的方式进行：

```javascript
module.exports = class extends doodoo.Controller {
    async index() {
        //图片 buffer 数据，读取本地文件或者从远程获取
        let imageBuffer = new Buffer();
        this.set('Content-Type', 'image/png');
        this.view(imageBuffer);
    }
}
```

#### 用户登录后才能访问

```javascript
// app/demo/controller/home/base.js
module.exports = class extends doodoo.Controller {
    async _initialize() {
        await this.isLogin();
    }

    async isLogin() {
        // 判断登录业务逻辑
    }
}
```

```javascript
// app/demo/controller/home/index.js
const base = require("./base");
module.exports = class extends base {
    async _initialize() {
        await super._initialize();
    }
  	
  	async index() {
      	this.success();
  	}
}
```



## 应用

### 模块

Doodoo.js 创建项目时支持多种项目模式，默认创建的项目是按模块来划分的。使用模块的方式划分项目，可以让项目结构更加清晰。

#### 模块列表

`app` 下面的目录就是模块列表



### 控制器

控制器是一类操作的集合，用来响应用户同一类的请求。

#### 定义控制器

创建文件 `app/demo/controller/home/index.js`，表示 `demo` 模块下有名为 `home/index` 控制器，文件内容类似如下：

```javascript
module.exports = class extends doodoo.Controller {
  	async index (){
      	this.view('Hello World!');
    }
}
```

#### 常用控制器方法

ctx上的函数或参数将自动加载到Controller，例如支持 `this.body = 'Hello World!'`, ctx中具体的API请参考Koa.js, Controller中的扩展方法如下。

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
this.fail(errmsg = "error", errcode = 1);
```



### 配置

#### 默认配置


```yml
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
#### 修改配置

创建 `.env` 配置文件，例如修改默认启动端口

```yml
app:
  port: 3000
```

### 路由

#### 自动加载路由

Doodoo.js默认使用了自动加载路由，类似于thinkphp的开发方式。例如访问的路径是 `/demo/home/user/index`，demo会解析成模块，home/user会解析成控制器，index会解析成方法，此时会加载 `app/demo/controller/home/user.js` 下的index方法。

#### 多级控制器

Doodoo.js支持多级控制器，例如访问的路径是 `/demo/home/shop/product/index`，demo会解析成模块，home/shop/product会解析成控制器，index解析成方法，此时会加载 `app/controller/home/shop/product.js` 下的index方法。

### 钩子

钩子一般用于数据统计，功能扩展等，默认是开启状态。


```javascript
// hook.js
// 注册新增订单钩子
module.exports = {
    async addOrder(){
        // 业务逻辑
    }
}

// 允许新增订单钩子
// 运行 - 等待
await this.hook.run('addOrder', 1);

// 运行 - 不等待
this.hook.run('addOrder', 1);
```



### 前后置

Doodoo.js登录授权验证如果是异步的，可以放到前后置操作里面。如果前后置操作输出数据到页面的话，响应将会中断不会再继续执行下面的流程。

```javascript
// app/demo/controller/home/index.js
module.exports = class extends doodoo.Controller {
    async _initialize() {
      	// 控制器初始化
    }

    async _before() {
        // 控制器前置
    }

    async _before_index() {
        // 方法前置
    }

    async index() {
        this.view('Hello World!');
    }

    async _after_index() {
        // 方法后置
    }

    async _after() {
        // 控制器后置
    }
}
```

### 模型

Doodoo.js默认使用了bookshelf。可以通过中间件的方式，自定义支持mysql，mongodb等等各种数据库。



## 中间件

### 中间件

例如使用 `koa-cors `中间件，跟使用koa.js中间件一样。

```javascript
const Doodoo = require("doodoo.js");
const cors = require("koa-cors");

const app = new Doodoo();

app.use(cors());
app.start();
```



### 常用中间件

[中间件列表](https://github.com/koajs/koa/wiki)

## 插件
插件是对中间件更深一层扩展，中间件可以很简单插件化。插件分为3种，第一种是doodoo.js内置插件，第二种是plugin目录下自己开发插件，第三种是直接使用npm发布的插件。npm上doodoo.js插件都是以`doodoo-plugin`开头。插件使用方式分2种，第一种app.plugin("xxx")，第二种doodoo.usePlugin("xxx")。



### 常用插件列表

#### redis

注册：

`app.plugin("redis") `

配置：

第一种方式

```javascript
app.plugin("redis", {
    host: "xxx",
    port: "xxx",
    prefix: "xxx",
    password: "xxx"
});
```

第二种方式（推荐使用）
```yml
# config.yml
redis:
    host: "xxx"
    port: "xxx"
    prefix: "xxx"
    password: "xxx"
```

使用

`this.redis` 或者 `doodoo.redis` 调用，具体api接口参考`https://www.npmjs.com/package/redis`

#### mysql

注册

`app.plugin("mysql")`

配置

第一种方式

```javascript
app.plugin("mysql", {
    host: "xxx",
    user: "xxx",
    password: "xxx",
    port: "xxx",
    database: "xxx",
    charset: "xxx"
});
```

第二种方式（推荐使用）

```yml
# config.yml
mysql:
    host: "xxx"
    user: "xxx"
    password: "xxx"
    port: "xxx"
    database: "xxx"
    charset: "xxx"
```

使用

`this.model("xxx")` 或者 `this.model("xxx")` 调用，具体api接口参考`http://bookshelfjs.org`

### 插件列表

[插件列表](https://www.npmjs.com/search?q=doodoo)


## 线上部署

正式环境推荐使用 `pm2` 启动项目，配置参考

```javascript
{
    "name": "doodoo.js-demo",
    "script": "app.js",
    "watch": false,
    "exec_mode": "cluster",
    "max_memory_restart": "1G",
    "error_file": "./logs/error.log",
    "out_file": "./logs/out.log",
    "node_args": [],
    "args": [],
    "env": {}
}
```



## API


### app

Doodoo实例

```javascript
const Doodoo = require("doodoo.js");

const app = new Doodoo();
```

获取socket

```javascript
const Doodoo = require("doodoo.js");
const socket = require("socket.io");

const app = new Doodoo();

(async () => {
    const server = app.start();
    const io = socket(server);
})
```



如发现文档中的错误，请[点击这里](mailto:786699892@qq.com)联系作者。