'use strict';

var path = require('path').posix,
	core = require(path.resolve('./src/server/app/core/controllers/core.server.controller.js'));

module.exports = function(app) {
	// Root routing
	app.route('/').get(core.index);
};
