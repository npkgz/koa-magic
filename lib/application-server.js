const _koa = require('./extend');
const _koa_compress = require('koa-compress');
const _koa_bodyparser = require('koa-bodyparser');
const _koa_session = require('koa-session');
const _koa_responsetime = require('koa-response-time');
const _httpErrorPages = require('http-error-pages');
const _keygrip = require('keygrip');
const _errorlogger = require('./errorlogger');
const _logger = require('logging-facility').getLogger('webserver');

/*eslint no-process-exit: 0*/
async function initWebserver(configSetup, applicationSetup){

    // new koa based webservice
    const _webapp = new _koa();
    
    // config provied by function or as object ?
    const config = (typeof configSetup === 'function') ? await configSetup(_webapp) : configSetup;

    // setup cookie hmac keys ?
    if (config.keygrip && config.keygrip !== false){
        _logger.debug('initializing middleware [keygrip]');

        // only key passed ? used default config
        if (Array.isArray(config.keygrip)){
            _webapp.keys = new _keygrip(config.keygrip, 'sha256', 'base64');

        // custom keygrip instance
        }else{
            _webapp.keys = config.keygrip;
        }
    }

    // handle http errors
    if (config.httpErrorPages !== false){
        _logger.debug('initializing middleware [httpErrorPages]');
        _webapp.use(await _httpErrorPages.koa(config.httpErrorPages));
    }

    // error logging
    if (config.errorlogger !== false){
        _logger.debug('initializing middleware [errorlogger]');
        _webapp.use(_errorlogger(true));
    }
    
    // send response time to client
    if (config.responsetime !== false){
        _logger.debug('initializing middleware [responsetime]');
        _webapp.use(_koa_responsetime());
    }

    // output compression
    if (config.compress !== false){
        _logger.debug('initializing middleware [compress]');
        _webapp.use(_koa_compress(config.compress));
    }

    // body parser (json+form)
    if (config.bodyparser !== false){
        _logger.debug('initializing middleware [bodyparser]');
        _webapp.use(_koa_bodyparser(config.bodyparser));
    }

    // session
    if (config.session !== false){
        _logger.debug('initializing middleware [session]');
        _webapp.use(_koa_session(config.session, _webapp));
    }

    // register application
    if (typeof applicationSetup === 'function'){
        _logger.debug('bootstrapping application');
        
        // async ?
        await applicationSetup(_webapp);
        
    }else{
        _logger.error('no application bootstrap provided');
    }

    // start webserver - default localhost:8888
    const listener = _webapp.listen(config.port || 8888, config.listen || '127.0.0.1', 511, function(){
        _logger.notice('webserver online [' + listener.address().port + '], PID ' + process.pid);
    });
}

// proxy
module.exports = function(config={}, applicationSetup=null){
    return {
        init: function(){

            // async init
            initWebserver(config, applicationSetup)
                .catch(function(e){
                    _logger.emergency('cannot initialized webserver', e);

                    // stop process
                    process.exit(1);
                });
        }
    }
}