'use strict';

var path = require('path').posix,
	config = require(path.resolve('./src/server/app/core/controllers/config.server.controller.js'));


module.exports = function(app) {

	// For now, just a single get for the global client configuration
	app.route('/config')
		.get(config.read);

};
