const _cluster = require('./lib/cluster');
const _webserver = require('./lib/m');

_cluster.init(_webserver);