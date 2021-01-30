const _ejs = require('ejs');
const _fs = require('fs-magic');
const _path = require('path');

module.exports = async function ejs(koa, opt={}){

    // apply default options
    const options = Object.assign({
        root: null,
        strict: true,
        localsName: 'vars',
        payloadFilter: function(p){ return p}
    }, opt);

    // valid view path ?
    if (!(await _fs.isDirectory(options.root))){
        throw new Error('view base path is not a directory - ' + options.root);
    }

    // add render function to context
    koa.context.render = function(view, payload={}){
        // reference to current context instance
        const ctx = this;

        return new Promise(function(resolve, reject){
            // generate full view name
            const filename = _path.join(options.root, view + '.ejs');

            // add koa context
            payload.ctx = ctx;

            // render ejs file
            // inject additional payloads
            _ejs.renderFile(filename, options.payloadFilter(payload, ctx), options, (err, html) => {
                if (err){
                    reject(err);
                }else{
                    // send content
                    ctx.type = 'html';
                    ctx.body = html;
                    resolve();
                }
            });
        });
    }
}


