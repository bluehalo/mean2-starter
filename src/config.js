/* eslint-disable no-console */
'use strict';

/**
 * Module dependencies.
 */
let
	_ = require('lodash'),
	fs = require('fs'),
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
let initAssets = (config) => {
	let mode = config.mode,
		assets = {};

	function loadAssets(filepath) {
		if (fs.existsSync(filepath)) {
			assets = _.merge(assets, require(filepath));
		}
	}

	loadAssets(path.resolve('./config/assets.js'));
	loadAssets(path.resolve('./config/client-assets.js'));

	if (assets.client) {
		assets.client.mode = assets.client.app.dist[mode]
	}

	return assets;
};

/**
 * Initialize global configuration files
 */
let initGlobalConfigFolders = (config, assets) => {
	// Appending files
	config.folders = {};

	if (assets.server) {
		config.folders.server = {};
	}
	if (assets.client) {
		// Setting globbed client paths
		config.folders.client = getGlobbedPaths(path.resolve('./src/client/'), process.cwd().replace(new RegExp(/\\/g),'/'));
	}
};

/**
 * Initialize global configuration files
 */
let initGlobalConfigFiles = (config, assets) => {
	// Appending files
	config.files = {};

	if (assets.server) {
		config.files.server = {};

		// Setting Globbed files for whatever keys have been provided
		_.forEach(assets.server, (values, key) => {
			config.files.server[key] = getGlobbedPaths(values);
		});
	}

	if (assets.client) {
		config.files.client = {};

		// Setting Globbed css files
		config.files.client.css = getGlobbedPaths(assets.client.mode.css, 'public');

		// Setting Globbed bundle files
		config.files.client.js = getGlobbedPaths(assets.client.mode.js, 'public');
	}

	if (assets.tests) {
		config.files.tests = {};

		// Setting Globbed files for whatever keys have been provided
		_.forEach(assets.tests, (values, key) => {
			config.files.tests[key] = getGlobbedPaths(values);
		});
	}
};

/**
 * Initialize global configuration
 */
let initGlobalConfig = () => {

	// Validate NDOE_ENV existance
	validateEnvironmentVariable();

	// Get the default config
	let defaultConfig = require(path.resolve('./config/env/default'));

	// Get the current config
	let environmentConfig = require(path.resolve('./config/env/', process.env.NODE_ENV)) || {};

	// Merge config files
	let config = _.extend(defaultConfig, environmentConfig);

	// Validate Critical configuration settings
	validateConfiguration(config);

	// Get the assets
	let assets = initAssets(config);

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
