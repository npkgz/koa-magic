koa-magic
=========================================
Supercharged, Ready-to-go, Web-Application Server

## Features ##

* Stackable routing middleware 
* Path-Match Router
* VHost Router (domain/hostname based)
* Easy to use application server including basic koa modules
* Components can be used standalone
* Cluster support/Hot-Reload via [cluster-magic](https://github.com/AndiDittrich/Node.cluster-magic)

## Install ##

```bash
$ npm install koa-magic --save
$ yarn add koa-magic
```

## Modules ##

koa-magic provides the following modules

* [Koa](docs/koa.md) - Extended Koa class including routing methods `require('koa-magic').Koa`
* [Router](docs/router.md) - Stackable - express like - routing middleware `require('koa-magic').Router`
* [ApplicationServer](docs/application-server.md) - Ready-to-use Koa webserver including basic middleware (compress, sessions) `require('koa-magic').ApplicationServer`

## Docs ##

TBD

## Router ##

The path is parsed by [path-to-regexp](https://github.com/pillarjs/path-to-regexp) to enable parametric paths. The parameters are exposed by the `ctx.params` object.

### Methods ##

The following methods are provided by each routing instance (or extended Koa class)

**HTTP**

* `get(path:string|RegExp, middleware:Promise)` handle http-get
* `post(path:string|RegExp, middleware:Promise)` handle http-post
* `put(path:string|RegExp, middleware:Promise)` handle http-put
* `head(path:string|RegExp, middleware:Promise)` handle http-head
* `delete(path:string|RegExp, middleware:Promise)` handle http-delete
* `options(path:string|RegExp, middleware:Promise)` handle http-options
* `all(path:string|RegExp, middleware:Promise)` handle all kind of http-methods

**VHOST**

* `vhost(hostname:string|RegExp, middleware:Promise|Router`) virtual host routing

**ROUTING**

* `attach(path:string|RegExp, middleware:Promise|Router`) add a new router to the current stack (like use)

### Examples ###

**Example 1 - path routing**
```js
const Router = require('koa-magic').Router;
const Koa = require('koa-magic').Koa;

// initialize koa + router
const webapp = new Koa();
const myrouter = new Router();

myrouter.get('/world.html', ctx => {
    ctx.body = "ook";
});
myrouter.post('/world.html', ctx => {
    ctx.body = "ook";
});

// attach to root path
koa.get('/helloworld.html' ctx => {
    ctx.body = 'Helloworld';
});

// attach router middleware - use attach() of extended Koa!
koa.attach('/hello', myrouter);

// start server
koa.listen(...);
```

**Example 2 - vhost routing**
```js
const Router = require('koa-magic').Router;
const Koa = require('koa-magic').Koa;

// initialize koa + router
const webapp = new Koa();
const myrouter = new Router();

myrouter.get('/world.html', ctx => {
    ctx.body = "ook";
});

// attach router middleware to domain
koa.vhost('example.org', myrouter);

// start server
koa.listen(...);
```

## License ##
koa-magic is OpenSource and licensed under the Terms of [The MIT License (X11)](http://opensource.org/licenses/MIT) - your're welcome to contribute
