const _Koa = require('koa');
const _router = require('./koa-router');

// is argument a router or direct middleware handler ?
function getMiddlewareHandler(fn){
    // bind to router instance or direct call ?
    return (fn instanceof _router.Router) ? fn.dispatch.bind(fn) : fn;
}

// extend Koa with routing methods
module.exports = class KoaApplication extends _Koa{

    constructor(){
        super();
    }

    // http method routing
    get(route, middleware){
        this.use(_router.get(route, middleware));
    }
    post(route, middleware){
        this.use(_router.post(route, middleware));
    }
    put(route, middleware){
        this.use(_router.put(route, middleware));
    }
    head(route, middleware){
        this.use(_router.head(route, middleware));
    }
    delete(route, middleware){
        this.use(_router.delete(route, middleware));
    }
    options(route, middleware){
        this.use(_router.options(route, middleware));
    }
    all(route, middleware){
        this.use(_router.all(route, middleware));
    }

    // use(middleware:Promise) or use(path, middleware:Router)
    attach(arg0, arg1=null){
        // native usage ?
        if (arg1 === null){
            this.use(getMiddlewareHandler(arg0));

        // attach router ?
        }else{
            this.use(_router.path(arg0, getMiddlewareHandler(arg1)));
        }
    }

    // domain routing
    vhost(route, middleware){
        this.use(_router.vhost(route, getMiddlewareHandler(middleware)));
    }
}