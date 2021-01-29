const { sendfile } = require('./sendfile');
const _path = require('path');

// generator function
module.exports = function factory(opt={}){

    // basedir set ?
    if (!opt.root){
        throw new Error('root directory is not set');
    }

    // absolute basedir ?
    if (!_path.isAbsolute(opt.root)){
        throw new Error('root directory has to be an absolute path');
    }

    // create middleware
    return async function staticFiles(ctx, next){

        // standard GET or HEAD request ?
        if (ctx.method === 'GET' || ctx.method === 'HEAD'){

            // try to fetch data - lowlevel errors will be thrown!
            const result = await sendfile(ctx.path.substr(1), ctx, opt);

            // file not found ? forward request
            if (result === false){
                return next();
            }

        // no action. forward request
        }else{
            return next();
        }
    }
}