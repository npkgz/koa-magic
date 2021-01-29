const _fs = require('fs-magic');
const _path = require('path');

const basedir = '/home/andi/Development';
const reldir = '../';

console.log(_path.relative(basedir, reldir));