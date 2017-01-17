'use strict';

let path = require('path'),

	justifications = require(path.resolve('./src/server/app/justifications/controllers/justifications.server.controller.js')),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

module.exports = function(app) {

	app.post('/justi', justifications.create);

	app.route('/justifications')
		.post(users.hasAccess, justifications.search);
};