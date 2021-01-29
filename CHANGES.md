Changelog 
========================


## Branch v1.x.x ##

### 1.0.2 ###

* Refactored codebase
* Added: `sendfile` implementation to serve single files (available within koa context)
* Added: staticfile implementation to serve static files within given root path (replaces koa-static)

## Preliminary Release ##

### 0.4.0 ###
Added: `extend()` method to extended Koa class to allow context injections
Changed: moved dispatcher methods from Router to `<koa-magic>.Dispatcher`
Changed: `Router` class is directly exposed `<koa-magic>.Router`

### 0.3.0 ###
Added: `AppicationServer` config can be a `function` or `object` - support for async configuration initialization
Changed: `ctx.path` is altered directly within routing to ensure third-party compatibility

### 0.2.0 ###
Added: support for multiple matches mounted on same path
Changed: splitted routing middleware into multiple parts

### 0.1.0 ###
Initial Public Release