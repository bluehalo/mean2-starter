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
	runSequence = require('run-sequence'),
	gulp = require('gulp'),
	plugins = require('gulp-load-plugins')(),
	glob = require('glob'),
	del = require('del'),
	webpack = require('webpack'),

	assets = require(path.resolve('./config/assets.js'));

// Patch chalk to use colors
chalk.enabled = true;
colors.enabled = true;


/**
 * --------------------------
 * Watch/Reload Tasks
 * --------------------------
 */


gulp.task('watch', () => {
	var config = require('./src/server/config');

	// Start livereload
	plugins.livereload.listen(config.devPorts.liveReload);

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
 * Client Build Tasks
 * --------------------------
 */

gulp.task('build', (done) => {
	runSequence('clean-client', ['build-code', 'build-style'], done);
});

gulp.task('clean', () => {
	return del([ 'public/**/*' ]);
});

gulp.task('build-code', ['lint-code'], (done) => {
	let webpackConfig = require(path.resolve('./config/build/webpack.conf.js'));

	webpack(webpackConfig('build'), (err, stats) => {

		// Fail if there were errors
		if(err) throw new plugins.util.PluginError('webpack', err);

		// log the stats from webpack
		plugins.util.log('[webpack]', stats.toString({
			colors: true, chunks: false
		}));

		done();
	});
});

gulp.task('lint-code', () => {
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

gulp.task('build-style', [ 'clean-style' ], () => {
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

gulp.task('clean-style', () => {
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


function runKarmaTest(callback) {
	const spawn = require('child_process').spawn;
	const karma = spawn('node', ['./config/build/test-client.js']);

	karma.stdout.pipe(process.stdout);
	karma.stderr.pipe(process.stderr);

	karma.on('close', callback);
}

gulp.task('test', ['env:test'], () => {

	const clientFilesToWatch = _.union(
		assets.tests.client,
		assets.client.app.src.ts,
		assets.client.app.src.sass,
		assets.client.app.views,
		assets.client.app.content,
		assets.build
	);

	const minTimeBetweenTestsCalls = 5000;

	const runKarmaTestWithDebounce = _.throttle(_.partial(runKarmaTest, _.noop), minTimeBetweenTestsCalls);

	gulp.watch(clientFilesToWatch, runKarmaTestWithDebounce);
	runKarmaTestWithDebounce();

});

gulp.task('test-ci', ['env:test'], runKarmaTest);
