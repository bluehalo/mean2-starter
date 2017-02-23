'use strict';

/**
 * Module dependencies.
 */
let
	path = require('path').posix,

	config = require(path.resolve('./src/server/config.js')),
	logger = require(path.resolve('./src/server/lib/bunyan.js')).logger,
	express = require(path.resolve('./src/server/lib/express.js')),
	mongoose = require(path.resolve('./src/server/lib/mongoose.js'));

logger.info('Starting initialization of Node.js server');

// Initialize mongoose
mongoose.connect()
	.then(function (db) {
		try {
			logger.info('Mongoose connected, proceeding with application configuration');

			// Initialize express
			let app = express.init(db.admin);

			// Start the app
			app.listen(config.port);

			// Init task scheduler
			let scheduler = require(path.resolve('./src/server/scheduler.js'));
			scheduler.start();

			logger.info('%s started on port %s', config.app.instanceName, config.port);
		} catch(err) {
			logger.fatal({err: err}, 'Express initialization failed.');
		}
	}, function(err) {
		logger.fatal({err: err}, 'Mongoose initialization failed.');
	}).done();
