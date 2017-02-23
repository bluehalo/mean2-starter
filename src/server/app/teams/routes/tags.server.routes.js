'use strict';

let path = require('path').posix,

	tags = require(path.resolve('./src/server/app/teams/controllers/tags.server.controller.js')),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

module.exports = function(app) {

	/**
	 * Tag Routes
	 */

	app.route('/tag')
		.put(users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.create);

	app.route('/tags')
		.post(users.hasAccess, tags.search);

	app.route('/tag/:tagId')
		.get(   users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresMember), tags.read)
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.update)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.delete);


	// Finish by binding the tag middleware
	app.param('tagId', tags.tagById);
};
