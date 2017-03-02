'use strict';

let _ = require('lodash'),
	mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),

	config = require(path.resolve('./src/server/config.js')),
	logger = require(path.resolve('./src/server/lib/bunyan.js')).logger;


// Set the mongoose debugging option based on the configuration, defaulting to false
let mongooseDebug = (config.mongooseLogging) || false;
logger.info(`Mongoose: Setting debug to ${mongooseDebug}`);
mongoose.set('debug', mongooseDebug);


// Override the global mongoose to use q for promises
mongoose.Promise = require('q').Promise;


// Load the mongoose models
let loadModels = () => {
	// Globbing model files
	config.files.server.models.forEach(function(modelPath) {
		logger.debug(`Mongoose: Loading ${modelPath}`);
		require(path.resolve(modelPath));
	});
};
module.exports.loadModels = loadModels;


// This is the set of db connections
let dbs = {};
module.exports.dbs = dbs;


// Initialize Mongoose, returns a promise
module.exports.connect = () => {
	let dbSpecs = [];
	let defaultDbSpec;


	// Organize the dbs we need to connect
	for(let dbSpec in config.db) {
		if(dbSpec === 'admin') {
			defaultDbSpec = { name: dbSpec, connectionString: config.db[dbSpec] };
		}
		else {
			dbSpecs.push({ name: dbSpec, connectionString: config.db[dbSpec] });
		}
	}


	// Connect to the default db to kick off the process
	return mongoose.connect(defaultDbSpec.connectionString).then((result) => {
		logger.info(`Mongoose: Connected to "${defaultDbSpec.name}" default db`);

		// store it in the db list
		dbs[defaultDbSpec.name] = mongoose;

		// Connect to the rest of the dbs
		dbSpecs.forEach((spec) => {
			// Create the secondary connection
			dbs[spec.name] = mongoose.createConnection(spec.connectionString);
		});

		// Since all the db connections worked, we will load the mongoose models
		loadModels();

		// Resolve the dbs since everything succeeded
		return dbs;

	}, function(err) {
		logger.fatal('Mongoose: Could not connect to admin db');
		return q.reject(err);
	});

};


//Disconnect from Mongoose
module.exports.disconnect = function() {

	// Create defers for mongoose connections
	let promises = _.values(this.dbs).map((d) => {
		if (d.disconnect) {
			return d.disconnect();
		}
		return q();
	});

	// Create a join for the defers
	return q.allSettled(promises);

};
