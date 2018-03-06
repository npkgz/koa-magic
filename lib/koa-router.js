const _compose = require('koa-compose');
const _createPathDisptacher = require('./router/path-dispatcher');
const _createDomainDisptacher = require('./router/vhost-dispatcher');

// create internal request match dispatcher
const _httpHandler = {
    all:        _createPathDisptacher(null),
    path:       _createPathDisptacher(null, false),
    post:       _createPathDisptacher('POST'),
    get:        _createPathDisptacher('GET'),
    put:        _createPathDisptacher('PUT'),
    delete:     _createPathDisptacher('DELETE'),
    options:    _createPathDisptacher('OPTIONS'),
    head:       _createPathDisptacher('HEAD'),
    vhost:      _createDomainDisptacher(),
};

// create new middleware with custom stack
class Router{

    constructor(){
        // middleware to dispatch
        this.middlewareStack = [];
    }

    // dispatch request by executing middleware stack
    dispatch(ctx, next){
        return _compose([...this.middlewareStack, next])(ctx);
    }

    // http method routing
    get(route, middleware){
        this.middlewareStack.push(_httpHandler.get(route, middleware));
    }
    post(route, middleware){
        this.middlewareStack.push(_httpHandler.post(route, middleware));
    }
    put(route, middleware){
        this.middlewareStack.push(_httpHandler.put(route, middleware));
    }
    head(route, middleware){
        this.middlewareStack.push(_httpHandler.head(route, middleware));
    }
    delete(route, middleware){
        this.middlewareStack.push(_httpHandler.delete(route, middleware));
    }
    options(route, middleware){
        this.middlewareStack.push(_httpHandler.options(route, middleware));
    }
    all(route, middleware){
        this.middlewareStack.push(_httpHandler.all(route, middleware));
    }

    // attach sub router
    attach(route, middleware){
        if (!(middleware instanceof Router)){
            throw new Error('cannot attach middleware - has to be of type Router')
        }

        // forward
        this.middlewareStack.push(_httpHandler.path(route, middleware.dispatch.bind(middleware)));
    }
}

module.exports = {
    all: _httpHandler.all,
    path: _httpHandler.path,
    get: _httpHandler.get,
    post: _httpHandler.post,
    put: _httpHandler.put,
    delete: _httpHandler.delete,
    head: _httpHandler.head,
    options: _httpHandler.options,
    vhost: _httpHandler.vhost,
    Router: Router
};