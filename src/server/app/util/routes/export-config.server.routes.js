'use strict';

var
	path = require('path'),

	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	exportConfig = require(path.resolve('./src/server/app/util/controllers/export-config.server.controller.js'));


module.exports = function(app) {
	// Admin post CSV config parameters
	app.route('/requestExport')
		.post(users.hasAccess, exportConfig.requestExport);

	// This route would typically be implemented for a specific module or export type (ex. resources export
	// would have a route in resources.server.routes and a "getExport" function on the resources.server.controller)
	app.route('/export/:exportId')
		.get(users.hasAccess, users.hasAny(users.requiresAdminRole), exportConfig.getExport);
};
