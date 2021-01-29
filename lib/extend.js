const _Koa = require('koa');
const _Router = require('./router');
const _httpDispatcher = require('./dispatcher');

// is argument a router or direct middleware handler ?
function getMiddlewareHandler(fn){
    // bind to router instance or direct call ?
    return (fn instanceof _Router) ? fn.dispatch.bind(fn) : fn;
}

// extend Koa with routing methods
module.exports = class KoaApplication extends _Koa{

    constructor(){
        super();
    }

    // http method routing
    get(route, middleware){
        this.use(_httpDispatcher.get(route, middleware));
    }
    post(route, middleware){
        this.use(_httpDispatcher.post(route, middleware));
    }
    put(route, middleware){
        this.use(_httpDispatcher.put(route, middleware));
    }
    head(route, middleware){
        this.use(_httpDispatcher.head(route, middleware));
    }
    delete(route, middleware){
        this.use(_httpDispatcher.delete(route, middleware));
    }
    options(route, middleware){
        this.use(_httpDispatcher.options(route, middleware));
    }
    all(route, middleware){
        this.use(_httpDispatcher.all(route, middleware));
    }

    // koa context extensions - just some sugar
    extend(middleware, ...opt){
        return middleware(this, ...opt);
    }

    // use(middleware:Promise) or use(path, middleware:Router)
    attach(arg0, arg1=null){
        // native usage ?
        if (arg1 === null){
            this.use(getMiddlewareHandler(arg0));

        // attach router ?
        }else{
            this.use(_httpDispatcher.path(arg0, getMiddlewareHandler(arg1)));
        }
    }

    // domain routing
    vhost(route, middleware){
        this.use(_httpDispatcher.vhost(route, getMiddlewareHandler(middleware)));
    }
}