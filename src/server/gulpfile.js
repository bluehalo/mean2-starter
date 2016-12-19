'use strict';

/**
 * @module src/server/gulpfile
 *
 * This file is intended to be run as a submodule called from ../../gulpfile.js
 */

let
	_ = require('lodash'),
	path = require('path'),
	chalk = require('chalk'),
	colors = require('colors'),
	gulp = require('gulp'),
	plugins = require('gulp-load-plugins')(),
	glob = require('glob'),
	argv = require('yargs').argv,

	pkg = require('./package.json'),
	assets = require(path.resolve('./config/assets.js'));

// Patch chalk to use colors
chalk.enabled = true;
colors.enabled = true;

/**
 * --------------------------
 * Watch/Reload Tasks
 * --------------------------
 */

/**
 * Nodemon helper function. This function will start nodemon
 * using the provided configuration. It also registers handlers
 * for the crash and restart events to log the events.
 *
 * @param nodemonConfig The config to pass to nodemon
 * @returns {*}
 */
function nodemon(nodemonConfig) {
	let config = require('./src/server/config');
	let nodeArgs = ['--debug=' + config.devPorts.debug, '--inspect'];
	if (plugins.util.env.debugBrk) {
		nodeArgs.push('--debug-brk');
	}
	nodemonConfig.nodeArgs = nodeArgs;

	let stream = plugins.nodemon(nodemonConfig);
	stream
		.on('restart', () => {
			plugins.util.log('Restarting server...');
		})
		.on('crash', () => {
			plugins.util.log('Application crashed, restarting...');
			stream.emit('restart', 1);
		});

	return stream;
}

gulp.task('watch', () => {
	return nodemon({
		script: 'src/server/server.js',
		ext: 'js json html',
		watch: _.union(
			assets.build,
			assets.server.views,
			assets.server.allJS,
			assets.server.config),
		tasks: [ 'build-server' ]
	});
});



/**
 * --------------------------
 * Server Build Tasks
 * --------------------------
 */
gulp.task('build', () => {
	return gulp.src(_.union(assets.server.allJS, assets.tests.server, assets.build))
		// ESLint
		.pipe(plugins.eslint('./config/build/eslint.conf.json'))
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());
});



/**
 * --------------------------
 * Testing Tasks
 * --------------------------
 */

gulp.task('env:test', () => {
	// Set the environment to test
	process.env.NODE_ENV = 'test';
});


gulp.task('test', ['env:test'], () => {
	// Gather some args for custom testing
	let args = [];

	// --bail will cause mocha to stop on first error
	if(argv.bail) { args.push('--bail'); }

	// --filter will filter the test files using the glob pattern
	if(null != argv.filter) { args.push(`--filter='${argv.filter}'`); }

	// Run mocha tests with nodemon
	return nodemon({
		script: './config/build/test-server.js',
		ext: 'js json',
		env: { 'NODE_ENV': 'test' },
		args: args,
		watch: _.union(
			assets.tests.server,
			assets.server.allJS,
			assets.server.config,
			assets.build)
	});
});


gulp.task('coverage-init', () => {
	// Covering all server code minus routes
	return gulp.src([
			'src/server/**/*.js',
			'!src/server/**/routes/**/*.js'
		])
		// Covering files
		.pipe(plugins.istanbul({
			includeUntested: true
		}))
		// Force `require` to return covered files
		.pipe(plugins.istanbul.hookRequire());
});

gulp.task('test-ci', [ 'env:test', 'coverage-init' ], (done) => {
	// Run mocha tests with coverage and without nodemon

	// Open mongoose connections
	let mongoose = require('./src/server/lib/mongoose.js');

	let error = null;
	mongoose.connect().then(() => {
		let sources = assets.tests.server;

		gulp.src(sources)
			.pipe(plugins.mocha({
				reporter: 'mochawesome',
				reporterOptions: {
					reportDir: 'reports/tests',
					reportName: 'index',
					reportTitle: pkg.name + ' Server Test Results',
					inlineAssets: true
				}
			}))
			.pipe(plugins.istanbul.writeReports({
				dir: './reports/coverage',
				reporters: ['html']
			}))
			.on('error', (err) => {
				error = err;
			})
			.on('end', () => {
				mongoose.disconnect().then(() => {
					done(error);
				}).done();
			});
	}).done();
});