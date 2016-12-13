'use strict';

var	path = require('path'),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	messages = require(path.resolve('./src/server/app/messages/controllers/message.server.controller.js'));

module.exports = function(app) {

	/**
	 * @swagger
	 * /admin/message:
	 *   post:
	 *     tags: [message]
	 *     description: Creates a message.
	 *     required: true
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/MessageDto'
	 */
	app.route('/admin/message')
		.post(users.hasAdminAccess, messages.create);

	/**
	 * @swagger
	 * /messages:
	 *   post:
	 *     tags: [message]
	 *     description: Search for messages with a specific property value.
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
	app.route('/messages')
		.post(users.hasAccess, messages.search);

	/**
	 * @swagger
	 * /admin/message/{msgId}:
	 *   get:
	 *     tags: [message]
	 *     description: Returns the message with given message id.
	 *     parameters:
	 *     - in: path
	 *       name: msgId
	 *       type: string
	 *       required: true
	 *   post:
	 *     tags: [message]
	 *     description: Updates the message's information with the given message id.
	 *     parameters:
	 *     - in: path
	 *       name: msgId
	 *       type: string
	 *       required: true
	 *     - name: body
	 *       in: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/MessageDto'
	 *   delete:
	 *     tags: [message]
	 *     description: Deletes the message with the given message id.
	 *     parameters:
	 *     - in: path
	 *       name: msgId
	 *       type: string
	 *       required: true
	 */
	app.route('/admin/message/:msgId')
		.get(   users.hasAccess, messages.read)
		.post(  users.hasAdminAccess, messages.update)
		.delete(users.hasAdminAccess, messages.delete);

	// Bind the message middleware
	app.param('msgId', messages.messageById);
};

// Swagger Definitions

/**
 * @swagger
 * definitions:
 *   MessageDto:
 *     type: object
 *     required: [title, body]
 *     properties:
 *       title:
 *         type: string
 *         example: Sample Title
 *       tearline:
 *         type: string
 *         example: Sample Tear Line
 *       body:
 *         type: string
 *         example: Sample Body
 *       type:
 *         type: string
 *         enum: [MOTD, INFO, WARN, ERROR]
 */