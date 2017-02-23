'use strict';

let _ = require('lodash'),
	mongoose = require('mongoose'),
	path = require('path').posix,
	q = require('q'),

	config = require(path.resolve('./src/server/config.js')),
	logger = require(path.resolve('./src/server/lib/bunyan.js')).logger;

// Set the mongoose debugging option based on the configuration, defaulting to false
var mongooseDebug = (config.mongooseLogging) || false;
logger.info('Mongoose: Setting debug to %s', mongooseDebug);
mongoose.set('debug', mongooseDebug);

// Override the global mongoose to use q for promises
mongoose.Promise = require('q').Promise;

// Load the mongoose models
module.exports.loadModels = function() {
	// Globbing model files
	config.files.server.models.forEach(function(modelPath) {
		logger.debug('Mongoose: Loading %s', modelPath);
		require(path.resolve(modelPath));
	});
};


// This is the set of dbs
module.exports.dbs = {};

// Initialize Mongoose, returns a promise
module.exports.connect = function() {
	var that = this;

	var dbSpecs = [];
	var defaultDbSpec;

	// Organize the dbs we need to connect
	for(var dbSpec in config.db) {
		if(dbSpec === 'admin') {
			defaultDbSpec = { name: dbSpec, connectionString: config.db[dbSpec] };
		}
		else {
			dbSpecs.push({ name: dbSpec, connectionString: config.db[dbSpec] });
		}
	}

	// Connect to the default db to kick off the process
	var defaultDbDefer = q.defer();
	var defaultDb = mongoose.connect(defaultDbSpec.connectionString, defaultDbDefer.makeNodeResolver());

	// Once we're connected to the default db, try the others
	return defaultDbDefer.promise.then(function(result) {
		logger.info('Mongoose: Connected to \'%s\' default db', defaultDbSpec.name);

		// store it in the db list
		that.dbs[defaultDbSpec.name] = defaultDb;

		// Connect to the rest of the dbs
		var promises = dbSpecs.map(function(spec) {
			// Create the secondary connection
			var specDeferral = q.defer();
			var connection = mongoose.createConnection(spec.connectionString, specDeferral.makeNodeResolver());

			return specDeferral.promise.then(function(result) {
				logger.info('Mongoose: Connected to \'%s\' db', spec.name);
				that.dbs[spec.name] = connection;
				return connection;
			}, function(err) {
				logger.fatal('Mongoose: Could not connect to \'%s\' db', spec.name);
				return q.reject(err);
			});
		});

		return q.all(promises).then(function() {
			try {
				// Since all the db connections worked, we will load the mongoose models
				that.loadModels();

				// Resolve the dbs since everything succeeded
				return that.dbs;
			} catch (err) {
				// There was an error loading the models, so return in failure
				return q.reject(err);
			}
		});

	}, function(err) {
		logger.fatal('Mongoose: Could not connect to admin db');
		return q.reject(err);
	});

};


//Disconnect from Mongoose
module.exports.disconnect = function() {

	// Create defers for mongoose connections
	var promises = _.values(this.dbs).map(function(d) {
		var dbDeferral = q.defer();

		if (d.disconnect) {
			d.disconnect(dbDeferral.makeNodeResolver());
		}
		else {
			dbDeferral.resolve();
		}

		return dbDeferral.promise;
	});

	// Create a join for the defers
	return q.allSettled(promises);

};
