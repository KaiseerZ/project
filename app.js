let express = require('express'),
    path = require('path'),
    /*
     https://github.com/tj/consolidate.js
     template engine consolidation library for node.js
     */
    consolidate = require('consolidate');

let isDev = process.env.NODE_ENV !== 'production';
let app = express();
let port = 8081;

app.engine('html', consolidate.ejs); // config template engine
app.set('view engine', 'html'); // set key value
app.set('views', path.resolve(__dirname, './server/views'));// set key value

/*
 locals
 To provide global data when template rendering
 */
app.locals.env = process.env.NODE_ENV || 'dev';
app.locals.reload = true;

if (isDev) {
    // static assets served by webpack-dev-middleware & webpack-hot-middleware for development
    let webpack = require('webpack'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware'),
        webpackDevConfig = require('./webpack.dev.config.js');

    let compiler = webpack(webpackDevConfig);

    // attach to the compiler & the server
    app.use(webpackDevMiddleware(compiler, {

        // public path should be the same with webpack config
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }));
    app.use(webpackHotMiddleware(compiler));

    require('./server/routes')(app);

    // add "reload" to express, see: https://www.npmjs.com/package/reload
    let reload = require('reload');
    let http = require('http');

    let server = http.createServer(app);
    reload(server, app);

    server.listen(port, function () {
        console.log('App (dev) is now running on port 3000!');
    });
} else {

    // static assets served by express.static() for production
    app.use(express.static(path.join(__dirname, 'public')));
    require('./server/routes')(app);
    app.listen(port, function () {
        console.log('App (production) is now running on port 3000!');
    });
}
