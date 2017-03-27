'use strict';

const
	ngToolsWebpack = require('@ngtools/webpack'),
	path = require('path'),
	webpack = require('webpack'),
	StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin,

	config = require(path.posix.resolve('./src/server/config.js')),
	assets = require(path.posix.resolve('./config/assets.js'));

module.exports = (mode) => {

	/**
	 * Flags to determine the mode in which we're invoking webpack
	 *
	 *  'build' - Building the production JS
	 *  'develop' - Running webpack dev middleware for development
	 *  'test' - Running webpack for executing tests
	 */
	const build = (mode === 'build');
	const develop = (mode === 'develop');
	const test = mode.startsWith('test');
	const coverage = mode.includes(':coverage');

	// For testing, use this to override aot mode
	const aot = build;


	// The main webpack config object to return
	let wpConfig = {};


	/**
	 * Source map configuration
	 */
	if (build) {
		// Disable sourcemaps for prod build since they don't work anyways
		wpConfig.devtool = false;
	}
	else if (test) {
		// Inline sourcemaps required for coverage to work
		wpConfig.devtool = 'inline-source-map';
	}
	else {
		// Eval source maps for development (provides trace back to original TS)
		wpConfig.devtool = 'eval-source-map';
	}


	/**
	 * Entry points for the program
	 *
	 *   'vendor' - All third-party dependencies of the application
	 *   'application' - Application code
	 */
	if (test) {
		wpConfig.entry = {
			application: path.posix.resolve('./src/client/main.ts')
		};
	}
	else {
		wpConfig.entry = {
			application: path.posix.resolve('./src/client/main.ts'),
			vendor: path.posix.resolve('./src/client/vendor.ts')
		};
	}


	/**
	 * Bundle output definitions
	 *   Defines how output bundles are generated and named
	 */
	wpConfig.output = {};

	// If build mode set up for static loading of resources with cache busting
	if (build) {
		wpConfig.output.path = path.posix.resolve('./public');
		wpConfig.output.publicPath = '/';
		wpConfig.output.filename = '[name].[chunkhash].js';
		wpConfig.output.chunkFilename = '[id].[chunkhash].chunk.js';
	}
	// If develop mode, set up for dev middleware
	else if (develop) {
		wpConfig.output.path = path.posix.resolve('./public');
		wpConfig.output.publicPath= `${config.app.url.protocol}://${config.app.url.host}:${config.devPorts.webpack}/dev/`;
		wpConfig.output.filename = '[name].js';
		wpConfig.output.chunkFilename = '[name].js';
	}


	/**
	 * List of extensions that webpack should try to resolve
	 */
	wpConfig.resolve = {
		extensions: [
			'.ts', '.js','.json',
			'.woff', '.woff2', '.ttf', '.eot', '.svg',
			'.css', '.scss',
			'.html'
		]
	};

	/**
	 * Module Loaders for webpack
	 *   Teach webpack how to read various types of referenced dependencies
	 */
	wpConfig.module = {

		// Configured loaders
		loaders: [

			// CSS loader
			{ test: /\.css$/, loaders: [ 'style-loader?insertAt=top', 'css-loader' ] },

			// SCSS loader
			{ test: /\.scss$/, loaders: [ 'style-loader?insertAt=top', 'css-loader', 'sass-loader' ] },

			// Image file loader
			{ test: /\.png$/, loader: 'url-loader?limit=10000&mimetype=image/png' },
			{ test: /\.(gif|jpg|jpeg)$/, loader: 'file-loader' },

			// Font file loader (mostly for bootstrap/font-awesome)
			{ test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },

			// Font file loader (mostly for bootstrap/font-awesome)
			{ test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/, loader: 'file-loader' },

			// HTML file loader (for angular2 templates)
			{ test: /\.html$/, loader: 'html-loader' }

		]

	};

	if (develop) {

		// In develop mode, we want to add source maps from all asymmetrik components
		wpConfig.module.loaders.push({
			test: /node_modules\/@asymmetrik.*\.js$/,
			loader: 'source-map-loader',
			enforce: 'pre'
		});

	}

	if (aot) {

		// If we're in AOT mode, we want to build with the webpack loader
		wpConfig.module.loaders.unshift(
			{ test: /\.ts$/, loader: '@ngtools/webpack' }
		);

	}
	else {

		// Otherwise, we build with the regular ts-loader and template loader
		wpConfig.module.loaders.unshift(
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: {
					configFileName: path.posix.resolve('./tsconfig.json')
				}
			},
			{
				test: /\.ts$/,
				loader: 'angular2-template-loader'
			}
		);

	}


	/**
	 * Webpack plugins
	 */
	wpConfig.plugins = [];

	if(build) {

		// Minify if we're in build mode
		wpConfig.plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				minimize: true,
				sourceMap: false,
				output: {
					// Only comments matching this regex will be preserved
					comments: /@license/
				},
				compress: {
					// Don't show js warnings
					warnings: false
				}
			})
		);

		// Add a banner if we're in build mode
		wpConfig.plugins.push(new webpack.BannerPlugin(
			{ banner: assets.bannerString, raw: true, entryOnly: false }
		));

		// Pass environment variables through webpack so they can be used in client code
		// or in modules that webpack is bundling, including 3rd party node modules
		wpConfig.plugins.push(new webpack.DefinePlugin({
			'NODE_ENV': '"production"'
		}));
	}

	// Always add these plugins
	wpConfig.plugins.push(

		// Stats writer generates a file with webpack stats that can be analyzed at https://chrisbateman.github.io/webpack-visualizer/
		new StatsWriterPlugin({
			chunkModules: true,
			filename: '../reports/webpack-stats.json',
			fields: null
		}),

		// Specify all global packages
		new webpack.ProvidePlugin({
			d3: 'd3'
		}),

		// Context replacement for ng2
		new webpack.ContextReplacementPlugin(
			/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/
		)
	);

	if (aot) {

		// If we're in AOT mode, we need to configure the webpack AOT plugin
		wpConfig.plugins.push(
			new ngToolsWebpack.AotPlugin({
				tsConfigPath: './tsconfig-aot.json',
				entryModule: path.posix.resolve('./src/client/app/app.module#AppModule')
			})
		);

	}

	if (!test) {

		// Chunk common code if we're not running in test mode
		wpConfig.plugins.push(
			new webpack.optimize.CommonsChunkPlugin({
				name: [ 'application', 'vendor' ],
				minChunks: Infinity,
				filename: (build) ? '[name].[chunkhash].js' : '[name].js'
			})
		);

	}

	if (coverage) {

		// Coverage if we're running with coverage enabled
		wpConfig.module.loaders.push({
			test: /\.(js|ts)$/,
			loader: 'sourcemap-istanbul-instrumenter-loader?force-sourcemap=true',
			enforce: 'post',
			exclude: [
				/\.spec.ts$/,
				/node_modules/
			]
		});

	}

	return wpConfig;
};
