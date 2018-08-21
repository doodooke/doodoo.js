## 快速入门

### 介绍

#### 简介

​	DooDoo.js -- 中文最佳实践Node.js Web快速开发框架。支持Koa.js中间件，支持模块化，插件，钩子机制，可以直接在项目里使用 ES6/7（Generator Function, Class, Async & Await）等特性。同时吸收了thinkphp，laravel等国内外众多框架的设计理念和思想，让开发 Node.js 项目更加简单、高效、灵活。

​	使用 ES6/7 特性来开发项目可以大大提高开发效率，是趋势所在。并且新版的 Node.js 对 ES6 特性也有了较好的支持，即使有些特性还没有支持，也可以借助 [Babel](http://babeljs.io/) 编译来支持。

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
* 支持全局doodoo变量
* 支持Bookshelf, knex链接数据库
* 支持前置，后置操作
* 支持 Restful 设计
* 支持启动自定义
* 支持环境加载配置
* ...

#### 安装

环境要求：node >= 7.6.0, git（doodoo.js的所有包都托管在github上）
```javascript
//npm
npm install doodooke/doodoo.js --save
//yarn
yarn add doodooke/doodoo.js
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

​	项目中可以使用 ES6/7 里的特性，可以稳定运行在 >= 7.6.0 的 Node.js 环境中。

#### 详细的日志

##### 服务 启动日志

```
[doodoo] Version: 1.0.1
[doodoo] Website: 127.0.0.1
[doodoo] Nodejs Version: v10.5.0
[doodoo] Nodejs Platform: darwin x64
[doodoo] Server Enviroment: development
[doodoo] Server Startup Time: 212ms
[doodoo] Server Current Time: 2018-08-21 11:17:19
[doodoo] Server Running At: http://127.0.0.1:3000
```

##### HTTP 请求日志

```
<-- GET /home/index/index
--> GET /home/index/index 200 4ms 
```

#### 与其他框架的对比

##### 与 express/koa 对比

express/koa 是 2 个比较简单的框架，框架本身提供的功能比较简单，项目中需要借助大量的第三方插件才能完成项目的开发，所以灵活度比较高。但使用很多第三方组件一方面提高了项目的复杂度。

koa 1.x 使用 ES6 里的 `*/yield` 解决了异步回调的问题，但 `*/yield` 只会是个过渡解决方案，会被 ES7 里的 `async/await` 所替代。

##### 与 sails 对比

sails 也是一个提供整套解决方案的 Node.js 框架，对数据库、REST API、安全方面也很多封装，使用起来比较方便。

但 sails 对异步回调的问题还没有优化，还是使用 callback 的方式，给开发带来很大的不便，导致项目中无法较好的使用 ES6/7 特性。

##### 与 thinkjs 对比

thinkjs 是一个非常优秀的框架，在开发效率和体验上占有绝对优势，但是中间件非常少，框架还比较新，缺少社区等方面的支持，还没有经过超大型项目的检验。


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
[doodoo] Version: 1.0.1
[doodoo] Website: 127.0.0.1
[doodoo] Nodejs Version: v10.5.0
[doodoo] Nodejs Platform: darwin x64
[doodoo] Server Enviroment: development
[doodoo] Server Startup Time: 212ms
[doodoo] Server Current Time: 2018-08-21 11:17:19
[doodoo] Server Running At: http://127.0.0.1:3000
```



### 项目结构

​	项目默认使用的是mysql，redis数据库。

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

#### 使用 Babel 编译

虽然现在的 Node.js 版本已经支持了很多 ES6 的特性，但这些特性现在还只是实现了，V8 里还没有对这些特性进行优化。如：`*/yield` 等功能。

所以建议使用 Babel 来编译，一方面可以使用 ES6 和 ES7 几乎所有的特性，另一方面编译后的性能也比默认支持的要高。

#### 使用 async/await

`async/await` 是nodejs异步最终解决方案



### 断点调试

无论是在 VS Code（v1.7+） 下断点调试，还是在WebStorm 下断点调试，断点一定要设置在 runtime 目录下，不能设置在 app目录下。





### 常见问题

#### 为什么推荐 ES6/7 语法开发项目

ES6/7 里提供了大量的新特性，这些特性会带来巨大的开发便利和效率上的提升。如：ES6 里的 `*/yield` 和 ES7 里的 `async/await` 特性解决异步回调的问题；箭头函数解决 `this` 作用域的问题；`class` 语法糖解决类继承的问题。

虽然现在 Node.js 环境还没有完全支持这些新的特性，但借助 Babel 编译，可以稳定运行在现在的 Node.js 环境中。所以我们尽可以享受这些新特性带来的便利。

#### 如何修改服务监听的端口

默认情况下，Node.js 服务监听的端口为 `3000`，如果需要修改的话，可以通过修改配置文件`.env` 来修改，如：

```javascript
APP_PORT=3000
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
this.error(errmsg = "error", errcode = 1);
```



### 配置

#### 默认配置


```Text
# .env文件
# 应用配置
APP_ROOT=app
APP_PORT=3000
APP_HOST=127.0.0.1

# MYSQL数据库链接
MYSQL=true
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=doodoo
MYSQL_PORT=3306
MYSQL_CHARSET=utf8mb4

# REDIS链接
REDIS=false
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PREFIX=doodoo:

# 静态资源服务
STATIC_DIR=www
STATIC_MAXAGE=30 * 24 * 60 * 60
STATIC_DYNAMIC=true
```
#### 修改配置

创建 `.env` 配置文件，例如修改默认启动端口

```javascript
APP_PORT=3000
```

### 路由

#### 自动加载路由

Doodoo.js默认使用了自动加载路由，类似于thinkphp的开发方式。例如访问的路径是 `/demo/home/user/index`，demo会解析成模块，home/user会解析成控制器，index会解析成方法，此时会加载 `app/demo/controller/home/user.js` 下的index方法。

#### 多级控制器

Doodoo.js支持多级控制器，例如访问的路径是 `/demo/home/shop/product/index`，demo会解析成模块，shop/product会解析成控制器，index解析成方法，此时会加载 `app/controller/home/shop/product.js` 下的index方法。

### 钩子

钩子一般用于数据统计，功能扩展等，默认是开启状态。


```javascript
// 注册
this.hook.add('addOrder', async function sendEmail(orderId) {
    // 业务逻辑
});
this.hook.add('addOrder', async function addLog(orderId) {
    // 业务逻辑
});

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

### 线上部署

正式环境推荐使用 `pm2` 启动项目，配置参考

```javascript
{
    "name": "doodoo.js-demo",
    "script": "app.js",
    "watch": false,
    "ignore_watch": [
        "www/public",
        "logs",
        "node_modules"
    ],
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