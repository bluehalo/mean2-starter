'use strict';

let
	path = require('path'),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));


module.exports = function(app) {

	/**
	 * End User Agreement Routes
	 */

	/**
	 * @swagger
	 * /euas:
	 *   post:
	 *     tags: [eua]
	 *     description: Search for euas with a specific word in the title or text.
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
	app.route('/euas')
		.post(users.hasAdminAccess, users.searchEuas);

	/**
	 * @swagger
	 * /eua/accept:
	 *   post:
	 *     tags: [eua]
	 *     description: Lets the current user accept the eua.
	 */
	app.route('/eua/accept')
		.post(users.has(users.requiresLogin), users.acceptEua);

	/**
	 * @swagger
	 * /eua/{euaId}/publish:
	 *   post:
	 *     tags: [eua]
	 *     description: Lets the current user accept the eua.
	 *     parameters:
	 *     - in: path
	 *       name: euaId
	 *       required: true
	 *       type: string
	 */
	app.route('/eua/:euaId/publish')
		.post(users.hasAdminAccess, users.publishEua);

	/**
	 * @swagger
	 * /eua/{euaId}:
	 *   get:
	 *     tags: [eua]
	 *     description: Returns the eua with given eua id.
	 *     parameters:
	 *     - in: path
	 *       name: euaId
	 *       type: string
	 *       required: true
	 *   post:
	 *     tags: [eua]
	 *     description: Updates the eua's information with the given eua id.
	 *     parameters:
	 *     - in: path
	 *       name: euaId
	 *       type: string
	 *       required: true
	 *     - name: body
	 *       in: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/EuaDto'
	 *   delete:
	 *     tags: [eua]
	 *     description: Deletes the message with the given eua id.
	 *     parameters:
	 *     - in: path
	 *       name: euaId
	 *       type: string
	 *       required: true
	 */
	app.route('/eua/:euaId')
		.get(   users.hasAdminAccess, users.getEuaById)
		.post(  users.hasAdminAccess, users.updateEua)
		.delete(users.hasAdminAccess, users.deleteEua);

	/**
	 * @swagger
	 * /eua:
	 *   get:
	 *     tags: [eua]
	 *     description: Gets the user's current eua.
	 *   post:
	 *     tags: [eua]
	 *     description: Creates an eua for the current user.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/EuaDto'
	 */
	app.route('/eua')
		.get( users.has(users.requiresLogin), users.getCurrentEua)
		.post(users.hasAdminAccess, users.createEua);

	// Finish by binding the user middleware
	app.param('euaId', users.euaById);

};

/**
 * @swagger
 * definitions:
 *   EuaDto:
 *     type: object
 *     required: [title, body]
 *     properties:
 *       title:
 *         type: string
 *       text:
 *         type: string
 */