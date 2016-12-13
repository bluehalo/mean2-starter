'use strict';

let path = require('path'),

	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	auditController = require(path.resolve('./src/server/app/audit/controllers/audit.server.controller.js'));

module.exports = function(app) {

	app.route('/audit')
		.post(users.hasAuditorAccess, auditController.search);

	app.route('/audit/distinctValues')
		.get(users.hasAuditorAccess, auditController.getDistinctValues);

};
