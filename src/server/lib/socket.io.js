'use strict';

// Load the module dependencies
let
	cookieParser = require('cookie-parser'),
	http = require('http'),
	passport = require('passport'),
	path = require('path'),
	socketio = require('socket.io'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),

	config = require(path.resolve('./src/config.js')),
	logger = require(path.resolve('./src/server/lib/bunyan.js')).logger;

/**
 * Controllers created outside of this class will register
 * themselves as socket listeners, with function definitions
 * stored here.
 */
var registeredSocketListeners = [];

// Give each socket connection its own variable scope
function onConnect(socket) {
	logger.debug('SocketIO: New client connection');

	/**
	 * Setup Socket Event Handlers
	 */
	registeredSocketListeners.forEach(function(S) {
		new S({ socket: socket });
	});
}

// Define the Socket.io configuration method
module.exports = function(app, db) {

	// Create a new HTTP server
	logger.info('Creating HTTP Server');
	var server = http.createServer(app);

	// Create a new Socket.io server
	logger.info('Creating SocketIO Server');
	var io = socketio.listen(server);

	// Create a MongoDB storage object
	var mongoStore = new MongoStore({
		db: db.connection.db,
		collection: config.auth.sessionCollection
	});

	// Intercept Socket.io's handshake request
	io.use(function(socket, next) {
		// Use the 'cookie-parser' module to parse the request cookies
		cookieParser(config.auth.sessionSecret)(socket.request, {}, function(err) {
			// Get the session id from the request cookies
			var sessionId = socket.request.signedCookies['connect.sid'];

			// Use the mongoStorage instance to get the Express session information
			mongoStore.get(sessionId, function(err, session) {
				// Set the Socket.io session information
				socket.request.session = session;

				// Use Passport to populate the user details
				passport.initialize()(socket.request, {}, function() {
					passport.session()(socket.request, {}, function() {
						if (socket.request.user) {
							logger.debug('SocketIO: New authenticated user: %s', socket.request.user.username);
							next(null, true);
						} else {
							logger.info('SocketIO: Unauthenticated user attempting to connect.');
							next(new Error('User is not authenticated'), false);
						}
					});
				});
			});
		});
	});

	// Add an event listener to the 'connection' event
	io.on('connection', onConnect);

	return server;
};

/*
 * App-specific function to register controllers that will be
 * sent the socket
 */
module.exports.registerSocketListener = function(s) {
	var name = s;
	if (null != s.prototype.name) {
		name = s.prototype.name;
	}

	logger.info('Registering Socket Listener: %s', name);
	registeredSocketListeners.push(s);
};
