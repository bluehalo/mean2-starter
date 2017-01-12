'use strict';

let path = require('path'),

	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	auditController = require(path.resolve('./src/server/app/audit/controllers/audit.server.controller.js'));

module.exports = function(app) {

	/**
	 * @swagger
	 * /audit:
	 *   post:
	 *     tags: [audit]
	 *     description: Search for messages with a specific word in the message, action, auditType or object.
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
	app.route('/audit')
		.post(users.hasAuditorAccess, auditController.search);

	/**
	 * @swagger
	 * /audit/distinctValues:
	 *   get:
	 *     tags: [audit]
	 *     description: Retrieves the distinct values for a field in the audit collection.
	 *     parameters:
	 *     - in: query
	 *       name: field
	 *       type: string
	 */
	app.route('/audit/distinctValues')
		.get(users.hasAuditorAccess, auditController.getDistinctValues);
};