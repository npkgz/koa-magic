// regex with parametric expressions
const _path2regex = require('path-to-regexp');

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

            // current (active path)
            const currentPath = ctx.path || '';
            const currentParams = ctx.params || {};

            // request path match ? use parent router path if available
            const result = pathMatcher.exec(currentPath);

            // no match ? skip
            if (result === null){
                return next();
            }

            // get full match
            const matchedPart = result.shift();

            // assign paths to ctx object - may required by sub-routers
            ctx._routedPath = matchedPart;
            ctx.path = currentPath.substr(matchedPart.length);

            // merge key=>value pairs to generate request.params
            const requestParams = {};
            for (let i=0;i<paramKeys.length && i<result.length;i++){
                // decode uri components, assign values to params
                requestParams[paramKeys[i].name] = (result[i] ? decodeURIComponent(result[i]) : null);
            }

            // add params to context
            ctx.params = Object.assign(currentParams, requestParams);

            // request forwarded by next() call
            function forwardRequest(){
                // reset params + path
                ctx.params = currentParams;
                ctx.path = currentPath;

                // forward
                return next();
            }

            // run middleware
            return middleware(ctx, forwardRequest);
        }
    }
}

module.exports = createPathDisptacher;