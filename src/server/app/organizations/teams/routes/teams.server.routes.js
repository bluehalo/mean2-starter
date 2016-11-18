'use strict';

let path = require('path'),

	teams = require(path.resolve('./src/server/app/organizations/teams/controllers/teams.server.controller.js')),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

module.exports = function(app) {

	/**
	 * Team Routes
	 */

	app.route('/team')
		.put(users.hasEditorAccess, teams.create);

	app.route('/teams')
		.post(users.hasAccess, teams.search);

	app.route('/team/:teamId')
		.get(   users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresMember), teams.read)
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.update)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.delete);

	/**
	 * Team editors Routes (requires team admin role)
	 */
	app.route('/team/:teamId/members')
		.post(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresMember), teams.searchMembers);

	app.route('/team/:teamId/member/:memberId')
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.addMember)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.removeMember);

	app.route('/team/:teamId/member/:memberId/role')
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.updateMemberRole);


	// Finish by binding the team middleware
	app.param('teamId', teams.teamById);
	app.param('memberId', teams.teamUserById);
};
