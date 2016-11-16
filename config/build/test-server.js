/* eslint-disable no-console */
'use strict';

/**
 * Module dependencies.
 */
let	Mocha = require('mocha'),
	path = require('path'),

	config = require(path.resolve('./src/server/config.js')),
	mongoose = require(path.resolve('./src/server/lib/mongoose.js'));

console.info('Starting initialization of tests');

// Initialize mongoose
mongoose.connect().then(() => {
	console.info('Mongoose connected, proceeding with tests');

	process.on('exit', () => {
		mongoose.disconnect();
	});

	// Create the mocha instance
	let mocha = new Mocha({
		reporter: 'spec'
	});

	// Add all the tests to mocha
	config.files.server.tests.forEach((file) => { mocha.addFile(file); });

	try {
		// Run the tests.
		mocha.run(() => { process.exit(); });

	} catch(ex) {
		console.error('Tests Crashed');
		console.error(ex);
		process.exit(1);
	}

}, () => {
	console.error('Mongoose initialization failed, tests failed.');
});
