'use strict';

let path = require('path'),
	notifications = require(path.resolve('./src/server/app/notifications/controllers/notification.server.controller.js')),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

module.exports = function(app) {

	app.route('/notifications')
		.post(users.hasAccess, notifications.search);

};
