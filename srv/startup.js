// initialize logger
const _loggingFacility = require('logging-facility');
_loggingFacility.addBackend('fancy-cli');

const _cluster = require('cluster-magic');
const _webserver = require('../lib/koa-webserver');
const _router = require('../lib/koa-router');

function applicationHandler(koa){

    const appRouter = new _router.Router();

    appRouter.get('/hello', ctx => {
        ctx.body = "Router MAtch";
    });

    koa.get('/hello', ctx => {
        ctx.cookies.set("hello", "world", { signed: true } )
        ctx.body = "ok";
    });

    koa.get('/helloo', ctx => {
        ctx.body = "ook";
    });

    koa.get('/hello/x', ctx => {
        ctx.body = "xok";
    });

    koa.attach('/test', appRouter);

    koa.vhost('sapphire.localnet', ctx => {
        ctx.body = "domain1";
    });

    koa.vhost('wordpress.localnet', ctx => {
        ctx.body = "domain2";
    });
}

const config = {
    listen: '0.0.0.0',
    port: 8888,
    keygrip: ['helloworld']
};

// initialize clustered application
/*_cluster.init(
    // initialize koa webserver/application server
    _webserver(config, applicationHandler)
);*/


// initialize single instance
 _webserver(config, applicationHandler).init();
