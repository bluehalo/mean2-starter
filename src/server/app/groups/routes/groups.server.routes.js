'use strict';

var path = require('path'),

	groups = require(path.resolve('./src/server/app/groups/controllers/groups.server.controller.js')),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

module.exports = function(app) {

	/**
	 * Group Routes
	 */

	app.route('/group')
		.post(users.hasEditorAccess, groups.create);

	app.route('/groups')
		.post(users.hasAccess, groups.search);

	app.route('/group/:groupId')
		.get(   users.hasAccess, users.hasAny(users.requiresAdminRole, groups.requiresAdmin), groups.read)
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, groups.requiresAdmin), groups.update)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, groups.requiresAdmin), groups.delete);

	/**
	 * Group editors Routes (requires group admin role)
	 */
	app.route('/group/:groupId/users')
		.post(users.hasAccess, users.hasAny(users.requiresAdminRole, groups.requiresAdmin), groups.searchMembers);

	app.route('/group/:groupId/user/:userId')
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, groups.requiresAdmin), groups.userAdd)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, groups.requiresAdmin), groups.userRemove);

	app.route('/group/:groupId/user/:userId/role')
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, groups.requiresAdmin), groups.userRoleAdd)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, groups.requiresAdmin), groups.userRoleRemove);


	// Finish by binding the group middleware
	app.param('groupId', groups.groupById);
	app.param('userId', users.userById);
};
