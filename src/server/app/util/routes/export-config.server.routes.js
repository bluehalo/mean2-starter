'use strict';

var
	path = require('path').posix,

	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	exportConfig = require(path.resolve('./src/server/app/util/controllers/export-config.server.controller.js'));


module.exports = function(app) {
	// Admin post CSV config parameters
	app.route('/requestExport')
		.post(users.hasAccess, exportConfig.requestExport);
};
