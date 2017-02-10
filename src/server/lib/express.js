'use strict';

/**
 * Module dependencies.
 */
let path = require('path'),
	config = require(path.resolve('./src/server/config.js')),
	logger = require(path.resolve('./src/server/lib/bunyan.js')).logger,

	bodyParser = require('body-parser'),
	compress = require('compression'),
	cookieParser = require('cookie-parser'),
	express = require('express'),
	handlebars = require('express-handlebars'),
	session = require('express-session'),
	favicon = require('serve-favicon'),
	flash = require('connect-flash'),
	helmet = require('helmet'),
	methodOverride = require('method-override'),
	morgan = require('morgan'),
	passport = require('passport'),

	MongoStore = require('connect-mongo')(session);

/**
 * Initialize local variables
 */
function initLocalVariables(app) {
	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;

	// Asset files
	app.locals.jsFiles = config.files.client.js;
	app.locals.cssFiles = config.files.client.css;

	// Development
	app.locals.developmentMode = config.mode === 'development';
	app.locals.liveReload = config.liveReload;

	// Passing the request url to environment locals
	app.use(function (req, res, next) {
		res.locals.host = config.app.baseUrlWithoutPort;
		res.locals.url = config.app.baseUrl + req.originalUrl;
		next();
	});
}

/**
 * Initialize application middleware
 */
function initMiddleware(app) {
	// Showing stack errors
	app.set('showStackError', true);

	// Should be placed before express.static
	app.use(compress({
		filter: function (req, res) {
			if (req.headers['x-no-compression']) {
				// don't compress responses with this request header
				return false;
			}

			// fallback to standard filter function
			return compress.filter(req, res);
		},
		level: 6
	}));

	// Initialize favicon middleware
	app.use(favicon(path.resolve('./src/client/app/img/brand/favicon.ico')));

	// Environment dependent middleware
	if (config.mode === 'development') {
		// Disable views cache
		app.set('view cache', false);
	} else if (config.mode === 'production') {
		app.locals.cache = 'memory';
	}

	// Optionally turn on express logging
	if (config.expressLogging) {
		app.use(morgan('dev'));
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Add the cookie parser and flash middleware
	app.use(cookieParser(config.auth.sessionSecret));
	app.use(flash());

}

/**
 * Configure view engine
 */
function initViewEngine(app) {

	let hbs = handlebars.create({
		extname: '.server.view.html',
		defaultLayout: 'main',
		layoutsDir: path.resolve('./src/server/app/core/views/layouts'),
		partialsDir: path.resolve('./src/server/app/core/views'),
		helpers: {
			block: function(name) {
				let blocks = this._blocks;
				let content = blocks && blocks[name];
				return content ? content.join('\n') : null;
			},
			contentFor: function(name, options) {
				let blocks = this._blocks || (this._blocks = {});
				let block = blocks[name] || (blocks[name] = []);
				block.push(options.fn(this));
			}
		}
	});
	app.engine('.server.view.html', hbs.engine);

	// Set views path and view engine
	app.set('view engine', '.server.view.html');
	app.set('views', path.resolve('./src/server/app/core/views'));
}

/**
 * Configure Express session
 */
function initSession(app, db) {
	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.auth.sessionSecret,
		cookie: config.auth.sessionCookie,
		store: new MongoStore({
			db: db.connection.db,
			collection: config.auth.sessionCollection
		})
	}));
}

/**
 * Configure passport
 */
function initPassport(app) {
	app.use(passport.initialize());
	app.use(passport.session());

	require(path.resolve('./src/server/lib/passport.js')).init();
}

/**
 * Invoke modules server configuration
 */
function initModulesConfiguration(app, db) {
	config.files.server.configs.forEach(function (configPath) {
		require(path.resolve(configPath))(app, db);
	});
}

/**
 * Configure Helmet headers configuration
 */
function initHelmetHeaders(app) {
	// Use helmet to secure Express headers
	app.use(helmet.frameguard());
	app.use(helmet.xssFilter());
	app.use(helmet.noSniff());
	app.use(helmet.ieNoOpen());
	app.disable('x-powered-by');
}

/**
 * Configure the modules static routes
 */
function initModulesClientRoutes(app) {
	/*
	 * Exposing the public directory
	 */

	// Expose dev app files (w/ no caching) Order matters here, subdirs first
	app.use('/dev', express.static(path.resolve('./public/dev'), { maxAge: 0 }));

	// Expose the bundled production app files (with caching)
	app.use('/', express.static(path.resolve('./public'), { maxAge: 31536000000 }));

	// Expose the libraries (dev or prod based on assets.js configuration)
	//app.use('/lib', express.static(path.resolve('./public/lib'), { maxAge: 31536000000 }));

	// Expose the source application resources that aren't compiled/bundled
	// These are not cached for the time being since they are served from the subdirs directly and there is no
	// way to easily cache bust them
	config.folders.client.forEach(function (staticPath) {
		app.use(staticPath, express.static(path.resolve('./' + staticPath), { maxAge: 0 }));
		app.use(staticPath.replace('/client', ''), express.static(path.resolve('./' + staticPath), { maxAge: 0 }));
	});
}

/**
 * Configure the modules ACL policies
 */
function initModulesServerPolicies(app) {
	// Globbing policy files
	config.files.server.policies.forEach(function (policyPath) {
		require(path.resolve(policyPath)).invokeRolesPolicies();
	});
}

/**
 * Configure the modules server routes
 */
function initModulesServerRoutes(app) {
	// Globbing routing files
	config.files.server.routes.forEach(function (routePath) {
		require(path.resolve(routePath))(app);
	});
}

/**
 * Configure the modules sockets by simply including the files.
 * Do not instantiate the modules.
 */
function initModulesServerSockets(app) {
	// Globbing socket files
	config.files.server.sockets.forEach(function (socketPath) {
		require(path.resolve(socketPath));
	});
}

/**
 * Configure error handling
 */
function initErrorRoutes(app) {
	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function (err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		logger.error(err);

		// send server error
		res.status(500).json({ status: 500, type: 'server-error', message: 'Unexpected server error' });
	});

	// Assume 404 since no middleware responded
	app.use(function (req, res) {
		// Send 404 with error message
		res.status(404).json({ status: 404, type: 'not-found', message: 'The resource was not found' });
	});
}

function initWebpack(app) {
	if(config.mode === 'development') {

		let webpackDevMiddleware = require('webpack-dev-middleware');
		let webpackConfig = require(path.resolve('./config/build/webpack.conf.js'))('develop');
		let webpack = require('webpack')(webpackConfig);

		// Configure Express to use the webpack dev middleware
		app.use(webpackDevMiddleware(webpack, {
			publicPath: webpackConfig.output.publicPath,
			stats: { colors: true, chunks: false },
			watchOptions: {
				aggregateTimeout: 300,
				poll: 1000
			}
		}));
	}
}

/**
 * Configure Socket.io
 */
function configureSocketIO(app, db) {
	// Load the Socket.io configuration
	var server = require(path.resolve('./src/server/lib/socket.io.js'))(app, db);

	// Return server object
	return server;
}

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {

	// Initialize express app
	logger.info('Initializing Express');
	var app = express();

	// Initialize local variables
	initLocalVariables(app);

	// Initialize Express middleware
	initMiddleware(app);

	// Initialize Express view engine
	initViewEngine(app);

	// Initialize Webpack
	initWebpack(app);

	// Initialize modules static client routes
	initModulesClientRoutes(app);

	// Initialize Express session
	initSession(app, db);

	// Initialize passport auth
	initPassport(app);

	// Initialize Modules configuration
	initModulesConfiguration(app);

	// Initialize Helmet security headers
	initHelmetHeaders(app);

	// Initialize modules server authorization policies
	initModulesServerPolicies(app);

	// Initialize modules server routes
	initModulesServerRoutes(app);

	// Initialize modules sockets
	initModulesServerSockets(app);

	// Initialize error routes
	initErrorRoutes(app);

	// Configure Socket.io
	app = configureSocketIO(app, db);

	return app;
};
