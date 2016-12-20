'use strict';

let path = require('path'),

	tags = require(path.resolve('./src/server/app/teams/controllers/tags.server.controller.js')),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

module.exports = function(app) {

	/**
	 * Tag Routes
	 */

	/**
	 * @swagger
	 * /tag:
	 *   put:
	 *     tags: [tag]
	 *     description: Creates a tag.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/TagDto'
	 */
	app.route('/tag')
		.put(users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.create);

	/**
	 * @swagger
	 * /tags:
	 *   post:
	 *     tags: [tag]
	 *     description: Search for tags with a specific word in the name or description.
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
	app.route('/tags')
		.post(users.hasAccess, tags.search);

	/**
	 * @swagger
	 * /admin/tag/{tagId}:
	 *   get:
	 *     tags: [tag]
	 *     description: Returns the tag with given tag id.
	 *     parameters:
	 *     - in: path
	 *       name: tagId
	 *       type: string
	 *       required: true
	 *   post:
	 *     tags: [tag]
	 *     description: Updates the tag's information with the given tag id.
	 *     parameters:
	 *     - in: path
	 *       name: tagId
	 *       type: string
	 *       required: true
	 *     - name: body
	 *       in: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/TagDto'
	 *   delete:
	 *     tags: [tag]
	 *     description: Deletes the tag with the given tag id.
	 *     parameters:
	 *     - in: path
	 *       name: tagId
	 *       type: string
	 *       required: true
	 */
	app.route('/tag/:tagId')
		.get(   users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresMember), tags.read)
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.update)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.delete);


	// Finish by binding the tag middleware
	app.param('tagId', tags.tagById);
};

// Swagger Definitions

/**
 * @swagger
 * definitions:
 *   TagDto:
 *     type: object
 *     required: [name]
 *     properties:
 *       name:
 *         type: string
 *         example: Sample Name
 *       description:
 *         type: string
 *         example: Sample Description
 *       owner:
 *         type: string
 */