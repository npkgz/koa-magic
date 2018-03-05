// regex with parametric expressions
const _path2regex = require('path-to-regexp');
const _compose = require('koa-compose');

// utility - compare requested method with route
function methodMatch(requestMethod, routeMethod){
    // no path route given ? match all
    if (routeMethod===null){
        return true;
    }

    // request method matches ?
    if (requestMethod === routeMethod){
        return true;
    }

    // head request ?
    if (routeMethod === 'GET' && requestMethod === 'HEAD'){
        return true;
    }

    // default
    return false;
  }

// generator to create path match dispatcher
function createPathDisptacher(httpMethod, fullMatch=true){
    // middleware generator
    return function route(path, middleware){
        // create path match expression
        const paramKeys = [];
        const pathMatcher = _path2regex(path, paramKeys, {
            end: fullMatch
        });
        
        // create middleware
        return function dispatchRoute(ctx, next){
            // request method matches ? otherwise skip
            if (!methodMatch(ctx.method, httpMethod)){
                return next();
            }

            // request path match ? use parent router path if available
            const result = pathMatcher.exec(ctx._subPath || ctx.path || '');

            // no match ? skip
            if (result === null){
                return next();
            }

            // get full match
            const matchedPart = result.shift();

            // assign paths to ctx object - may required by sub-routers
            ctx._routedPath = matchedPart;
            ctx._subPath = ctx.path.substr(matchedPart.length);

            // merge key=>value pairs to generate request.params
            const requestParams = {};
            for (let i=0;i<paramKeys.length && i<result.length;i++){
                // decode uri components, assign values to params
                requestParams[paramKeys[i].name] = (result[i] ? decodeURIComponent(result[i]) : null);
            }

            // add params to context
            ctx.params = Object.assign(ctx.params || {}, requestParams);

            // run middleware
            return middleware(ctx, next);
        }
    }
}

// generator to create domain match dispatcher
function createDomainDisptacher(){
    // middleware generator
    return function route(domain, middleware){

        // string or regex ?
        if (typeof domain === 'string'){
        
            // create middleware
            return function dispatchDomain(ctx, next){
                // simple domain match ?
                if (ctx.hostname === domain){
                    return middleware(ctx, next);
                }else{
                    return next();
                }
            }

        // regex ?
        }else if (domain instanceof RegExp){

            // create middleware
            return function dispatchDomain(ctx, next){
                // regex match ?
                if (domain.test(ctx.hostname)){
                    return middleware(ctx, next);
                }else{
                    return next();
                }
            }
            
        }else{
            throw new Error('domain route expression has to be of type string/RegExp');
        }
    }
}

// create internal handler
const _httpHandler = {
    all: createPathDisptacher(null),
    path: createPathDisptacher(null, false),
    post: createPathDisptacher('POST'),
    get: createPathDisptacher('GET'),
    put: createPathDisptacher('PUT'),
    delete: createPathDisptacher('DELETE'),
    options: createPathDisptacher('OPTIONS'),
    head: createPathDisptacher('HEAD'),
    vhost: createDomainDisptacher(),
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