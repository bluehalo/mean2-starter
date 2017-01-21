/* eslint-disable no-console */
'use strict';

let	Mocha = require('mocha'),
	path = require('path'),
	argv = require('yargs').argv,

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
	let options = {
		reporter: 'spec'
	};
	if (argv.bail) {
		console.log('Mocha: Setting option \'bail\' to true.');
		options.bail = true;
	}
	let mocha = new Mocha(options);

	// Add all the tests to mocha
	let testCount = 0;
	config.files.server.tests.forEach((file) => {
		if(!(argv.filter) || file.match(new RegExp(argv.filter))) {
			testCount++;
			mocha.addFile(file);
		}
	});
	console.log(`Mocha: Executing ${testCount} test files.`);

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
}).done();
