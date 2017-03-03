'use strict';

let
	express = require('express'),
	path = require('path'),

	teams = require(path.posix.resolve('./src/server/app/teams/controllers/teams.server.controller.js')),
	users = require(path.posix.resolve('./src/server/app/admin/controllers/users.server.controller.js'));


/**
 * Team Routes
 */

let router = express.Router();

router.route('/team')
	.put(users.hasEditorAccess, teams.create);

router.route('/teams')
	.post(users.hasAccess, teams.search);

router.route('/team/:teamId')
	.get(   users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresMember), teams.read)
	.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.update)
	.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.delete);

/**
 * Team editors Routes (requires team admin role)
 */
router.route('/team/:teamId/members')
	.post(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresMember), teams.searchMembers);

router.route('/team/:teamId/member/:memberId')
	.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.addMember)
	.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.removeMember);

router.route('/team/:teamId/member/:memberId/role')
	.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.updateMemberRole);


// Finish by binding the team middleware
router.param('teamId', teams.teamById);
router.param('memberId', teams.teamUserById);

module.exports = router;
