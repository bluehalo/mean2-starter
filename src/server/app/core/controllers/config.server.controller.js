'use strict';

var path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	pjson = require(path.resolve('./package.json'));


var getSystemConfig = function() {
	var toReturn = {

		auth: config.auth.strategy,
		requiredRoles: config.auth.requiredRoles,

		mode: config.mode,
		clientEnableProdMode: config.clientEnableProdMode,

		version: pjson.version,
		banner: config.banner,
		copyright: config.copyright,

		map: config.map,
		urlHandler: config.urlHandler,

		maxScan: config.maxScan,
		maxExport: config.maxExport,
		notifications: config.notifications,
		sourcing: config.sourcing
	};

	return toReturn;
};

exports.getSystemConfig = getSystemConfig;

// Read
exports.read = function(req, res) {
	/**
	 *  Add unsecured configuration data
	 */
	res.json(getSystemConfig());
};
