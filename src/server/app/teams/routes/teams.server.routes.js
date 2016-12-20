'use strict';

let path = require('path'),

	teams = require(path.resolve('./src/server/app/teams/controllers/teams.server.controller.js')),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

module.exports = function(app) {

	/**
	 * Team Routes
	 */

	/**
	 * @swagger
	 * /team:
	 *   put:
	 *     tags: [team]
	 *     description: Creates a team.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/TeamDto'
	 */
	app.route('/team')
		.put(users.hasEditorAccess, teams.create);

	/**
	 * @swagger
	 * /teams:
	 *   post:
	 *     tags: [team]
	 *     description: Search for teams with a specific word in the title or description.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       schema:
	 *         type: object
	 *         required: [s]
	 *         properties:
	 *           q:
	 *             type: object
	 *           s:
	 *             type: string
	 *     - in: query
	 *       name: page
	 *       type: integer
	 *     - in: query
	 *       name: size
	 *       type: integer
	 *     - in: query
	 *       name: sort
	 *       type: string
	 *     - in: query
	 *       name: dir
	 *       type: string
	 *       enum: [ASC, DESC]
	 */
	app.route('/teams')
		.post(users.hasAccess, teams.search);

	/**
	 * @swagger
	 * /team/{teamId}:
	 *   get:
	 *     tags: [team]
	 *     description: Returns the team with given team id.
	 *     parameters:
	 *     - in: path
	 *       name: teamId
	 *       type: string
	 *       required: true
	 *   post:
	 *     tags: [team]
	 *     description: Updates the team's information with the given team id.
	 *     parameters:
	 *     - in: path
	 *       name: teamId
	 *       type: string
	 *       required: true
	 *     - name: body
	 *       in: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/TeamDto'
	 *   delete:
	 *     tags: [team]
	 *     description: Deletes the team with the given team id.
	 *     parameters:
	 *     - in: path
	 *       name: teamId
	 *       type: string
	 *       required: true
	 */
	app.route('/team/:teamId')
		.get(   users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresMember), teams.read)
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.update)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.delete);

	/**
	 * Team editors Routes (requires team admin role)
	 */

	/**
	 * @swagger
	 * /team/{teamId}/members:
	 *   post:
	 *     tags: [team]
	 *     description: Gets all members of a team.
	 *     parameters:
	 *     - in: path
	 *       name: teamId
	 *       required: true
	 *       type: string
	 */
	app.route('/team/:teamId/members')
		.post(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresMember), teams.searchMembers);

	/**
	 * @swagger
	 * /team/{teamId}/member/{memberId}:
	 *   post:
	 *     tags: [team]
	 *     description: Adds the user to the team.
	 *     parameters:
	 *     - in: path
	 *       name: teamId
	 *       required: true
	 *       type: string
	 *     - in: path
	 *       name: memberId
	 *       required: true
	 *       type: string
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       type: object
	 *       schema:
	 *         $ref: '#/definitions/BodyRole'
	 *   delete:
	 *     tags: [team]
	 *     description: Removes the user from the team.
	 *     parameters:
	 *     - in: path
	 *       name: teamId
	 *       required: true
	 *       type: string
	 *     - in: path
	 *       name: memberId
	 *       required: true
	 *       type: string
	 */
	app.route('/team/:teamId/member/:memberId')
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.addMember)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.removeMember);

	/**
	 * @swagger
	 * /team/{teamId}/member/{memberId}/role:
	 *   post:
	 *     tags: [team]
	 *     description: Changes the role of a member on a team.
	 *     parameters:
	 *     - in: path
	 *       name: teamId
	 *       required: true
	 *       type: string
	 *     - in: path
	 *       name: memberId
	 *       required: true
	 *       type: string
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       type: object
	 *       schema:
	 *         $ref: '#/definitions/BodyRole'
	 */
	app.route('/team/:teamId/member/:memberId/role')
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, teams.requiresAdmin), teams.updateMemberRole);


	// Finish by binding the team middleware
	app.param('teamId', teams.teamById);
	app.param('memberId', teams.teamUserById);
};

// Swagger Definitions

/**
 * @swagger
 * definitions:
 *   TeamDto:
 *     type: object
 *     required: [name]
 *     properties:
 *       name:
 *         type: string
 *         example: Sample Name
 *       description:
 *         type: string
 *         example: Sample Description
 *       requiresExternalTeams:
 *         type: array
 *         example: []
 *         items:
 *           type: string
 *   BodyRole:
 *     type: object
 *     required: [role]
 *     properties:
 *       role:
 *         type: string
 *         enum: [member, editor, admin]
 */