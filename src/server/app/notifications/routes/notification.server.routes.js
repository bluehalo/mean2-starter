'use strict';

let express = require('express'),
	path = require('path'),
	notifications = require(path.resolve('./src/server/app/notifications/controllers/notification.server.controller.js')),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

let router = express.Router();

router.route('/notifications')
	.post(users.hasAccess, notifications.search);

module.exports = router;
