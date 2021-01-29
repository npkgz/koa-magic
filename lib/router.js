const _compose = require('koa-compose');
const _httpHandler = require('./dispatcher');

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

module.exports = Router;