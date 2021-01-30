const _crypto = require('crypto');

async function generateToken(length){
    // generate random token
    const token = await _crypto.randomBytes(length);

    // current timestamp
    const ts = Date.now();

    // urlsafe base64
    return token.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '') + '#' + ts;
}

// Double Submit Cookie Token within session storage cookie - to be used with keygrip
// Authenticated via hmac/keygrip
// https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
module.exports = function csrf(opt={}){

    // apply default options
    const options = Object.assign({
        excludeMthods: ['GET', 'HEAD', 'OPTIONS'],
        tokenLength: 20,
        softfail: false,
        lifetime: 15*60*1000
    }, opt);

    // middleware
    return async function(ctx, next){

        function reject(msg){
            // set flag
            ctx.request.csrfValid = false;

            // softfail ?
            if (options.softfail === true){
                return next();
            }else{
                return ctx.throw(403, msg);
            }
        }

        // extract current session token
        const sessionToken = ctx.session && ctx.session.csrf || null;

        // generate new token and assign to session+response
        ctx.session.csrf = ctx.response._csrfToken = await generateToken(options.tokenLength);

        // only perform csrf check on post/put actions
        if (options.excludeMthods.includes(ctx.method)){
            return next();
        }

        // valid session token ?
        if (!sessionToken || typeof sessionToken !== 'string'){
            return reject('CSRF - sessionToken not set');
        }

        // try to extract existing request token
        const requestToken =
            (ctx.request.body && ctx.request.body._csrfToken) ||
            ctx.get('csrf-token') ||
            ctx.get('xsrf-token') ||
            ctx.get('x-csrf-token') ||
            ctx.get('x-xsrf-token') || 
            null;
        
        // valid request token ?
        if (!requestToken || typeof requestToken !== 'string'){
            return reject('CSRF - requestToken not set');
        }

        // token length match ? pre-condition for timingSafeEqual
        if (sessionToken.length !== requestToken.length){
            return reject('CSRF - request<>session token length not match');
        }

        // token equal ?
        if (!_crypto.timingSafeEqual(Buffer.from(sessionToken), Buffer.from(requestToken))){
            return reject('CSRF - token verification failed');
        }

        // token lifetime exceeded ?
        const tokenParts = requestToken.split('#');
        if (parseInt(tokenParts[1]) < (Date.now() - options.lifetime)){
            return reject('CSRF - token lifetime exceeded');
        }

        // set flag
        ctx.request.csrfValid = true;

        // ok - forward request
        next();
    }
}