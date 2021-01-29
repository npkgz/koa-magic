const _createPathDisptacher = require('./router/path-dispatcher');
const _createDomainDisptacher = require('./router/vhost-dispatcher');

// create internal request match dispatcher
const _httpHandler = {
    all:        _createPathDisptacher(null),
    path:       _createPathDisptacher(null, false),
    post:       _createPathDisptacher('POST'),
    get:        _createPathDisptacher('GET'),
    put:        _createPathDisptacher('PUT'),
    delete:     _createPathDisptacher('DELETE'),
    options:    _createPathDisptacher('OPTIONS'),
    head:       _createPathDisptacher('HEAD'),
    vhost:      _createDomainDisptacher(),
};

module.exports = {
    all: _httpHandler.all,
    path: _httpHandler.path,
    get: _httpHandler.get,
    post: _httpHandler.post,
    put: _httpHandler.put,
    delete: _httpHandler.delete,
    head: _httpHandler.head,
    options: _httpHandler.options,
    vhost: _httpHandler.vhost
};