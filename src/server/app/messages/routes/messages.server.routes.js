'use strict';

var	path = require('path'),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	messages = require(path.resolve('./src/server/app/messages/controllers/message.server.controller.js'));

module.exports = function(app) {

	// Create Message
	app.route('/admin/message')
		.post(users.hasAdminAccess, messages.create);

	// Search messages
	app.route('/messages')
		.post(users.hasAccess, messages.search);

	// Admin retrieve/update/delete
	app.route('/admin/message/:msgId')
		.get(   users.hasAccess, messages.read)
		.post(  users.hasAdminAccess, messages.update)
		.delete(users.hasAdminAccess, messages.delete);

	// Bind the message middleware
	app.param('msgId', messages.messageById);
};
