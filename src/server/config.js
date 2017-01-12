/* eslint-disable no-console */
'use strict';

/**
 * Module dependencies.
 */
let
	_ = require('lodash'),
	chalk = require('chalk'),
	glob = require('glob'),
	path = require('path');

/**
 * Get files by glob patterns
 */
let getGlobbedPaths = (globPatterns, excludes) => {
	// URL paths regex
	let urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	let output = [];

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
	if (_.isArray(globPatterns)) {
		globPatterns.forEach(function(globPattern) {
			output = _.union(output, getGlobbedPaths(globPattern, excludes));
		});
	} else if (_.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {
			let files = glob.sync(globPatterns);

			if (excludes) {
				files = files.map(function(file) {
					if (_.isArray(excludes)) {
						for (let i in excludes) {
							file = file.replace(excludes[i], '');
						}
					} else {
						file = file.replace(excludes, '');
					}

					return file;
				});
			}

			output = _.union(output, files);
		}
	}

	return output;
};


/**
 * Validate NODE_ENV existence
 */
let validateEnvironmentVariable = () => {

	if(null == process.env.NODE_ENV) {
		process.env.NODE_ENV = 'default';

		// Using console.log because this stuff happens before the environment is configured yet
		console.log('NODE_ENV not set, using default environment: "default" instead.');
	} else {
		console.log('NODE_ENV is set to: "' + process.env.NODE_ENV + '"');
	}

	// Try to get the environment file and see if we can load it
	let environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');

	if (!environmentFiles.length) {
		console.log(chalk.red('No configuration files found matching environment: "' + process.env.NODE_ENV + '"'));
		// Reset console color
		console.log(chalk.white(''));
	}

};

let validateConfiguration = (config) => {

	let msg = `Configuration mode set to ${config.mode}`;
	let chalkFn = (config.mode === 'development') ? chalk.green : (config.mode === 'production') ? chalk.blue : chalk.yellow;
	console.log(chalkFn(msg));

};

/**
 * Initialize the assets configuration object
 */
let initAssets = (assetsConfig, config) => {
	let mode = config.mode;

	return {
		client: {
			app: assetsConfig.client.app.dist[mode]
		},
		server: assetsConfig.server,
		tests: assetsConfig.tests
	};
};

/**
 * Initialize global configuration files
 */
let initGlobalConfigFolders = (config, assets) => {
	// Appending files
	config.folders = {
		server: {},
		client: {}
	};

	// Setting globbed client paths
	config.folders.client = getGlobbedPaths(path.join(process.cwd(), 'src/client/'), process.cwd().replace(new RegExp(/\\/g),'/'));
};

/**
 * Initialize global configuration files
 */
let initGlobalConfigFiles = (config, assets) => {
	// Appending files
	config.files = {
		server: {},
		client: {}
	};

	// Setting Globbed model files
	config.files.server.models = getGlobbedPaths(assets.server.models);

	// Setting Globbed route files
	config.files.server.routes = getGlobbedPaths(assets.server.routes);

	// Setting Globbed config files
	config.files.server.configs = getGlobbedPaths(assets.server.config);

	// Setting Globbed socket files
	config.files.server.sockets = getGlobbedPaths(assets.server.sockets);

	// Setting Globbed policies files
	config.files.server.policies = getGlobbedPaths(assets.server.policies);

	// Setting Globbed server test files
	config.files.server.tests = getGlobbedPaths(assets.tests.server);

	// Setting Globbed css files
	config.files.client.css = getGlobbedPaths(assets.client.app.css, 'public');

	// Setting Globbed bundle files
	config.files.client.js = getGlobbedPaths(assets.client.app.js, 'public');

};

/**
 * Initialize global configuration
 */
let initGlobalConfig = () => {

	// Validate NODE_ENV existence
	validateEnvironmentVariable();

	// Get the default config
	let defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

	// Get the current config
	let environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

	// Merge config files
	let config = _.extend(defaultConfig, environmentConfig);

	// Validate Critical configuration settings
	validateConfiguration(config);

	// Get the assets
	let assets = initAssets(require(path.join(process.cwd(), 'config/assets')), config);

	// Initialize global globbed files
	initGlobalConfigFiles(config, assets);

	// Initialize global globbed folders
	initGlobalConfigFolders(config, assets);

	// Store the original assets in the config
	config.assets = assets;

	// Expose configuration utilities
	config.utils = {
		getGlobbedPaths: getGlobbedPaths
	};

	return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
