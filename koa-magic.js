const _router = require('./lib/router');
const _koa = require('./lib/extend');
const _applicationServer = require('./lib/application-server');
const _errorLogger = require('./lib/errorlogger');
const _dispatcher = require('./lib/dispatcher');
const _sendfile = require('./lib/sendfile');
const _static = require('./lib/static-files');

module.exports = {
    Router: _router,
    Koa: _koa,
    ApplicationServer: _applicationServer,
    ErrorLogger: _errorLogger,
    Dispatcher: _dispatcher,
    Sendfile: _sendfile,
    StaticFiles: _static
};