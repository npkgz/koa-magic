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

module.exports = createDomainDisptacher;