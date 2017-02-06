'use strict';

let
	_ = require('lodash'),
	chalk = require('chalk'),
	colors = require('colors'),
	del = require('del'),
	glob = require('glob'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	path = require('path'),
	runSequence = require('run-sequence'),
	argv = require('yargs').argv,
	webpack = require('webpack'),

	pkg = require('./package.json'),
	plugins = gulpLoadPlugins(),
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
	let nodeArgs = ['--inspect=' + config.devPorts.debug];
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

gulp.task('watch-server', () => {
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


gulp.task('watch-client', () => {
	var config = require('./src/server/config');

	// Start livereload
	plugins.livereload.listen(config.liveReload.port);

	/*
	 * Add watch rules to trigger livereload
	 */

	// On changes to compiled stuff, recompile
	gulp.watch(assets.client.app.src.sass, ['build-client-style']);

	// In dev mode, we just want to re-lint ts code
	gulp.watch(assets.client.app.src.ts, ['lint-client-code'])
		.on('change', (d) => { setTimeout(() => { plugins.livereload.changed(d); }, 1000); });

	// When generated css changes, let livereload handle the changes
	gulp.watch(assets.client.app.dist.development.css).on('change', plugins.livereload.changed);

	// When views or content change, force livereload to reload the whole page (we had issues with changes getting missed)
	gulp.watch(assets.client.app.views).on('change', () => { setTimeout(plugins.livereload.reload, 1000); });
	gulp.watch(assets.client.app.content).on('change', () => { setTimeout(plugins.livereload.reload, 1000); });

});



/**
 * --------------------------
 * Server Build Tasks
 * --------------------------
 */
gulp.task('lint-server', () => {
	return gulp.src(_.union(assets.server.allJS, assets.tests.server, assets.build))
		// ESLint
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());
});
gulp.task('build-server', ['lint-server']);


/**
 * --------------------------
 * Client Build Tasks
 * --------------------------
 */

gulp.task('build-client', (done) => {
	runSequence('clean-client', ['build-client-code', 'build-client-style'], done);
});

gulp.task('clean-client', () => {
	return del([ 'public/**/*' ]);
});

gulp.task('build-client-code', ['lint-client-code'], (done) => {
	let webpackConfig = require(path.resolve('./config/build/webpack.conf.js'));

	webpack(webpackConfig('build'), (err, stats) => {

		// Fail if there were errors initiating webpack
		if(err) return done(new plugins.util.PluginError('webpack', err));

		// log the stats from webpack
		plugins.util.log('[webpack]', stats.toString({
			colors: true, chunks: false
		}));

		let buildErrors;
		if (stats.hasErrors()) {
			buildErrors = new plugins.util.PluginError('webpack', 'Errors during webpack build. See webpack output for details.');
		}
		done(buildErrors);
	});
});

gulp.task('lint-client-code', () => {

	// Grab the tslint config
	var config = require(path.resolve('./config/build/tslint.conf.js'));
	config.formatter = 'prose';

	return gulp.src(assets.client.app.src.ts)
		// Lint the Typescript
		.pipe(plugins.tslint(config))
		.pipe(plugins.tslint.report({
			summarizeFailureOutput: true,
			emitError: true
		}));

});

gulp.task('build-client-style', [ 'clean-client-style' ], () => {

	// Generate a list of the sources in a deterministic manner
	let sourceArr = [];
	assets.client.app.src.sass.forEach((f) => {
		sourceArr = sourceArr.concat(glob.sync(f).sort());
	});

	return gulp.src(sourceArr)

		// Lint the Sass
		.pipe(plugins.sassLint({
			formatter: 'stylish',
			rules: require(path.resolve('./config/build/sasslint.conf.js'))
		}))
		.pipe(plugins.sassLint.format())
		.pipe(plugins.sassLint.failOnError())

		// Compile and concat the sass (w/sourcemaps)
		.pipe(plugins.sourcemaps.init())
			.pipe(plugins.sass())
			.pipe(plugins.concat('application.css'))
			.pipe(plugins.insert.prepend(assets.bannerString))
		.pipe(plugins.sourcemaps.write('.', { sourceRoot: null }))
		.pipe(gulp.dest('public/dev'))

		// Clean the CSS
		.pipe(plugins.filter('public/dev/application.css'))
		.pipe(plugins.cleanCss())
		.pipe(plugins.insert.prepend(assets.bannerString))
		.pipe(plugins.hash({
			template: 'application.<%= hash %>.min.css',
			hashLength: 16
		}))
		.pipe(gulp.dest('public'));
});

gulp.task('clean-client-style', () => {
	return del([
		'public/application*.css',
		'public/dev/application.css', 'public/dev/application.css.map'
	]);
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

gulp.task('test-server', ['env:test'], () => {
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

function runKarmaTest(additionalEnvironmentVariables, callback) {
	const clientEnv = _.merge({}, process.env, additionalEnvironmentVariables);
	const spawn = require('child_process').spawn;
	const karma = spawn('node', ['./config/build/test-client.js'], {
		env: clientEnv
	});

	karma.stdout.pipe(process.stdout);
	karma.stderr.pipe(process.stderr);

	karma.on('close', callback);
}

gulp.task('test-client', ['env:test'], () => {
	runKarmaTest({}, _.noop);
});

gulp.task('test-client-ci', ['env:test'], (done) => {
	runKarmaTest({
		KARMA_CODE_COVERAGE_ENABLED: '1',
		KARMA_CI_MODE: '1'
	}, done);
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

gulp.task('test-server-ci', [ 'env:test', 'coverage-init' ], (done) => {
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
				dir: './reports/coverage/server',
				reporters: ['text-summary', 'lcov']
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


/**
 * --------------------------
 * Main Tasks
 * --------------------------
 */


/**
 * dev - main development task to run and watch server
 */
gulp.task('dev', (done) => {
	runSequence(
		[ 'build-server', 'build-client-style', 'lint-client-code' ],
		[ 'watch-server', 'watch-client' ],
		done);
});


/**
 * build - Builds production assets into ./public dir
 */
gulp.task('build', [ 'build-client', 'build-server' ]);


/**
 * test - Run tests in dev mode with nodemon
 */
gulp.task('test', (done) => { runSequence([ 'test-server', 'test-client' ], done); });


/**
 * Run tests in CI mode with coverage and no nodemon
 */
gulp.task('test-ci', (done) => { runSequence([ 'test-server-ci', 'test-client-ci' ], done); });


/**
 * Sets the default task
 */
gulp.task('default', [ 'build' ]);
