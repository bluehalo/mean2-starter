'use strict';

let
	_ = require('lodash'),
	fs = require('fs'),
	chalk = require('chalk'),
	colors = require('colors'),
	gulp = require('gulp'),
	runSequence = require('run-sequence').use(gulp);


// Patch chalk to use colors
chalk.enabled = true;
colors.enabled = true;


/**
 * --------------------------
 * Submodule tasks
 * --------------------------
 */

let hasClient = false, hasServer = false;

if (fs.existsSync('./src/server/gulpfile.js')) {
	hasServer = true;
	require('./src/server/gulpfile.js');
}

if (fs.existsSync('./src/client/gulpfile.js')) {
	hasClient = true;
	require('./src/client/gulpfile.js');
}

/**
 * @callback GulpCallback
 * @param {Object} err
 */

/**
 * Run a sequence of gulp commands. Any server or client tasks will be ignored
 * if the respective sections don't exist.
 *
 * @param {...(string|string[]|function)} tasks - A gulp task to run, or an array of tasks to run in parallel.
 *   The last argument must be a callback to invoke when all the tasks have completed.
 */
function run(tasks) {

	function isValidPath(path) {
		// Don't touch any functions
		if (_.isFunction(path)) {
			return path;
		}
		// Recursively iterate into arrays of parallel tasks
		if (_.isArray(path)) {
			let nested = _.chain(path).map(isValidPath).compact().value();
			return nested.length ? nested : false;
		}
		if (!hasServer && path.startsWith('server')) {
			return false;
		}
		if (!hasClient && path.startsWith('client')) {
			return false;
		}
		return path;
	}

	let filteredPaths = _.chain(arguments).clone().map(isValidPath).compact().value();
	runSequence.apply(null, filteredPaths);
}


/**
 * --------------------------
 * Testing Tasks
 * --------------------------
 */

gulp.task('env:test', () => {
	// Set the environment to test
	process.env.NODE_ENV = 'test';
});


/**
 * --------------------------
 * Main Tasks
 * --------------------------
 */


/**
 * dev - main development task to run and watch server
 */
gulp.task('dev', (done) => {
	run(
		[ 'server:build', 'client:build-style', 'client:lint-code' ],
		[ 'server:watch', 'client:watch' ],
		done);
});


/**
 * build - Builds production assets into ./public dir
 */
gulp.task('build', (done) => { run([ 'server:build', 'client:build' ], done); });


/**
 * test - Run tests in dev mode with nodemon
 */
gulp.task('test', (done) => { run([ 'server:test', 'client:test' ], done); });


/**
 * Run tests in CI mode with coverage and no nodemon
 */
gulp.task('test-ci', (done) => { run([ 'server:test-ci', 'client:test-ci' ], done); });


/**
 * Sets the default task
 */
gulp.task('default', [ 'build' ]);
