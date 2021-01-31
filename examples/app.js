const _loggingFacility = require('logging-facility');
const _path = require('path');
const _koaMagic = require('../koa-magic');

// logging
_loggingFacility.setBackend('fancy-cli');

// initialize middleware
function applicationHandler(koa){
    // trust proxy field
    koa.proxy = true;

    // enable ejs support
    await koa.extend(_koaMagic.EJS, {
        root: _path.join(__dirname, 'views')
    });

    // security
    koa.attach(function(ctx, next){
        ctx.set('X-Powered-By', 'lighttpd/aenon');

        // security
        ctx.set('X-XSS-Protection', '1; mode=block');
        ctx.set('X-Content-Type-Options', 'nosniff');
        ctx.set('X-Frame-Options', 'DENY');

        return next();
    });

    // static content with and without prefix
    koa.attach(/^(\/[a-z0-9]{12}|)/i, _koaMagic.StaticFiles({
        root: _path.join(__dirname, 'public'),
        maxAge: 1000*60*60*24*180,
        index: false
    }));

    // csrf middleware used for all direct request
    koa.attach(_koaMagic.CSRF({
        // validation erros cause 
        softfail: true,

        // 10s timeout
        lifetime: 2*1000
    }));

    koa.get('/hello/:id', (ctx) => {
        ctx.body = "hello world - " + ctx.params.id + ' - ' + ctx.response._csrfToken;
    });

    koa.get('/data', (ctx) => {
        ctx.render('example');
    });

    koa.post('/data', (ctx) => {
        ctx.render('example', {
            text: ctx.request.body.text
        });
    });
}

function configInitialization(){
    
    // webserver config
    const config = {
        listen: '0.0.0.0',
        port: 8888,
        keygrip: ['3nfoihf928fg29fg23'],
        session: {
            key: 'webapp',
            maxAge: 24*60*60*1000,
            sameSite: 'Lax',
            renew: true
        },
        httpErrorPages: {
            footer: 'MyFooter',
        }
    };

    return config;
}

_koaMagic.ApplicationServer(configInitialization, applicationHandler).init();