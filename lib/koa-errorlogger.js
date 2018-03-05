const _logger = require('logging-facility').getLogger('application');

module.exports = function errorlogger(rethrow=false){
    return async function(ctx, next){
        try{
            await next();
        }catch(e){
            _logger.error('application error', e);

            // rethrow
            if (rethrow===true){
                throw e;
            }
        }
    }
}