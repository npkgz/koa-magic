const _fs = require('fs-magic');
const _path = require('path');

// regex to find relative paths
const REL_PATH_REGEX = /(\.\.)[/\\]|[/\\](\.\.)/;

// resolve and normalize the path
function secureNormalizePath(rawFilename, basedir){

    // try to decode uri components
    let filename;
    try{
        filename = decodeURIComponent(rawFilename);

    // URIError - malformed URI sequences
    }catch(e){
        // invalid path
        return false;
    }

    // double escaped sequences found ?
    if (filename.indexOf('%') !== -1){
        return false;
    }

    // null bytes found ?
    if (filename.indexOf('\0') !== -1){
        return false;
    }

    // relative path found ? additional check
    if (filename.match(REL_PATH_REGEX)){
        return false;
    }

    // manual sendfile actions without basedir
    if (basedir === null){

        // absolute filename given ? manual sendfile triggered
        if (_path.isAbsolute(filename)){
            return _path.normalize(filename);

        // relative filenames not allowed without basedir
        }else{
            return false;
        }

    // basedir bounds given ?
    }else{

        // basedir restriction does not allow absolute filenames
        if (_path.isAbsolute(filename)){
            return false;

        }else{

            // add basedir + normalize
            filename = _path.resolve(basedir, filename);

            // resulting path outside root ?
            if (_path.relative(_path.normalize(basedir), filename).match(REL_PATH_REGEX)){
                return false;
            }else{
                return filename;
            }
        }
    }
}

async function sendfile(rawFilename, ctx, opt={}){
    // get basedir
    const basedir = opt.root ? _path.normalize(_path.resolve(opt.root)) : null;

    // get normalized filename/path
    const filename = secureNormalizePath(rawFilename, basedir);

    // invalid filename/path ? abort
    if (filename === false){
        return false;
    }

    // serve hidden files ?
    if (opt.hidden !== true){
        if (_path.basename(filename).substr(0,1) === '.'){
            return false;
        }
    }

    // try to stat the file
    let stats;
    try{
        stats = await _fs.stat(filename);
    }catch(e){
        // just return false in case the stat command failed (not found)
        if (['ENOENT', 'ENOTDIR', 'ENAMETOOLONG'].includes(e.code)){
            return false;
        }else{
            // forward other errors
            throw e;
        }
    }

    // is not a regular file ?
    if (!stats.isFile()){
        return false;
    }

    // headers to set
    let httpHeaders = {
        'Content-Length': stats.size,
        'Last-Modified': stats.mtime.toUTCString(),
        'Cache-Control': `max-age=${opt.maxage||0}`
    };

    // callback given ?
    if (opt.filterHeaders){
        httpHeaders = opt.filterHeaders(httpHeaders, ctx, filename, stats);
    }

    // apply http header
    for (const key in httpHeaders){
        // header already set by upper middleware ? skip
        if (!ctx.response.get(key)){
            // set header
            ctx.response.set(key, httpHeaders[key]);
        }
    }

    // set content type by given type (explicit), file extension or use fallback
    ctx.type = opt.type || _path.extname(filename) || 'application/octet-stream';

    // create new read stream
    ctx.body = _fs.createReadStream(filename);

    // ok
    return true;
}


// extend the koa Context with ctx.sendfile
function extendContext(koa){

    // add render sendfile to context
    koa.context.sendfile = function(filename, opt={}){
        // reference to current context instance
        const ctx = this;

        // run sendfile
        return sendfile(filename, ctx, opt);
    }
}

module.exports = {
    Extend: extendContext,
    sendfile: sendfile,
    normalizePath: secureNormalizePath
};