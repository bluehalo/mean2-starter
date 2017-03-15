'use strict';


let
	express = require('express'),
	path = require('path'),

	users = require(path.posix.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	messages = require(path.posix.resolve('./src/server/app/messages/controllers/message.server.controller.js'));

let router = express.Router();

// Create Message
router.route('/admin/message')
	.post(users.hasAdminAccess, messages.create);

// Search messages
router.route('/messages')
	.post(users.hasAccess, messages.search);

// Admin retrieve/update/delete
router.route('/admin/message/:msgId')
	.get(   users.hasAccess, messages.read)
	.post(  users.hasAdminAccess, messages.update)
	.delete(users.hasAdminAccess, messages.delete);

// Bind the message middleware
router.param('msgId', messages.messageById);

module.exports = router;
