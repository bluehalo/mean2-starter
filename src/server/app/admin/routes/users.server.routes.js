'use strict';

var
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	logger = deps.logger,

	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

module.exports = function(app) {
	/**
	 * User Routes (don't require admin)
	 */

	/**
	 * @swagger
	 * /user/me:
	 *   get:
	 *     tags: [user]
	 *     description: Returns the current user.
	 *   post:
	 *     tags: [user]
	 *     desciption: Allows a user to update their new information. If "password" is updated, "currentPassword" must be included.
	 *     parameters:
	 *     - name: body
	 *       in: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/UpdateUserDto'
	 */
	app.route('/user/me')
		.get( users.has(users.requiresLogin), users.getCurrentUser)
		.post(users.has(users.requiresLogin), users.updateCurrentUser);

	/**
	 * @swagger
	 * /user/{userId}:
	 *   get:
	 *     tags: [user]
	 *     description: Returns the user with the given userId (filtered view).
	 *     parameters:
	 *     - in: path
	 *       required: true
	 *       name: userId
	 *       type: string
	 */
	app.route('/user/:userId')
		.get(users.hasAccess, users.getUserById);

	/**
	 * @swagger
	 * /users:
	 *   post:
	 *     tags: [user]
	 *     description: Search for users with a specific word in the username, name, or email.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/QueryAndSearchBody'
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
	app.route('/users')
		.post(users.hasAccess, users.searchUsers);

	/**
	 * @swagger
	 * /users/match:
	 *   post:
	 *     tags: [user]
	 *     description: Search for users with a fragment in the username, name, or email.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/QueryAndSearchBody'
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
	app.route('/users/match')
		.post(users.hasAccess, users.matchUsers);

	/**
	 * @swagger
	 * /users/me/preferences/notifications/{notificationType}/{referenceId}:
	 *   get:
	 *     tags: [user]
	 *     description: Retrieves current user's notification preferences by type and id.
	 *     parameters:
	 *     - in: path
	 *       name: notificationType
	 *       type: string
	 *       enum: []
	 *     - in: path
	 *       name: referenceId
	 *       type: string
	 *   post:
	 *     tags: [user]
	 *     description: Update current user's notification preferences by type and id.
	 *     parameters:
	 *     - in: path
	 *       name: notificationType
	 *       type: string
	 *       enum: []
	 *     - in: path
	 *       name: referenceId
	 *       type: string
	 *     - in: body
	 *       name: body
	 *       schema:
	 *         type: object
	 *         properties:
	 *           email:
	 *             type: boolean
	 *           sms:
	 *             type: boolean
	 */
	app.route('/users/me/preferences/notifications/:notificationType/:referenceId')
		.get(users.hasAccess, users.getNotificationPreferencesByTypeAndId)
		.post(users.hasAccess, users.setNotificationPreferencesByTypeAndId);

	/**
	 * Admin User Routes (requires admin)
	 */

	/**
	 * @swagger
	 * /admin/user/{userId}:
	 *   get:
	 *     tags: [user]
	 *     description: Returns the user with the given user id (full view).
	 *     parameters:
	 *     - in: path
	 *       required: true
	 *       name: userId
	 *       type: string
	 *   post:
	 *     tags: [user]
	 *     description: Updates the user's user information with the given user id.
	 *     parameters:
	 *     - in: path
	 *       required: true
	 *       name: userId
	 *       type: string
	 *     - name: body
	 *       in: body
	 *       required: true
	 *       schema:
	 *         $ref: '#/definitions/AdminUpdateUserDto'
	 *   delete:
	 *     tags: [user]
	 *     description: Deletes the user with the given user id.
	 *     parameters:
	 *     - in: path
	 *       required: true
	 *       name: userId
	 *       type: string
	 */
	app.route('/admin/user/:userId')
		.get(   users.hasAdminAccess, users.adminGetUser)
		.post(  users.hasAdminAccess, users.adminUpdateUser)
		.delete(users.hasAdminAccess, users.adminDeleteUser);

	/**
	 * @swagger
	 * /admin/users:
	 *   post:
	 *     tags: [user]
	 *     description: Search for users with a specific property value.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       schema:
	 *         $ref: '#/definitions/QueryAndSearchBody'
	 *     - in: query
	 *       name: page
	 *       type: number
	 *     - in: query
	 *       name: size
	 *       type: number
	 *     - in: query
	 *       name: sort
	 *       type: string
	 *     - in: query
	 *       name: dir
	 *       type: string
	 *       enum: [ASC, DESC]
	 */
	app.route('/admin/users')
		.post(users.hasAdminAccess, users.adminSearchUsers);

	/**
	 * @swagger
	 * /admin/users/csv/{exportId}:
	 *   get:
	 *     tags: [user]
	 *     description: Returns user CSV using the specified config id.
	 *     parameters:
	 *     - in: path
	 *       name: exportId
	 *       description: exportId
	 *       required: true
	 *       type: string
	 */
	app.route('/admin/users/csv/:exportId')
		.get(users.hasAdminAccess, users.adminGetCSV);

	/**
	 * @swagger
	 * /admin/users/getAll:
	 *   post:
	 *     tags: [user]
	 *     description: Retrieve the supplied field from all users.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       required: true
	 *       schema:
	 *         type: object
	 *         required: [field]
	 *         properties:
	 *           field:
	 *             type: string
	 *           query:
	 *             type: object
	 */
	app.route('/admin/users/getAll')
		.post(users.hasAdminAccess, users.adminGetAll);

	/**
	 * Auth-specific routes
	 */

	/**
	 * @swagger
	 * /auth/signin:
	 *   post:
	 *     tags: [auth]
	 *     description: Signs into the application.
	 *     parameters:
	 *     - in: body
	 *       name: body
	 *       type: object
	 *       description: Local or proxy-pki config
	 */
	app.route('/auth/signin').post(users.signin);

	/**
	 * @swagger
	 * /auth/signout:
	 *   get:
	 *     tags: [auth]
	 *     description: Signs out of the application.
	 */
	app.route('/auth/signout')
		.get(users.has(users.requiresLogin), users.signout);

	/**
	 * Routes that only apply to the 'local' passport strategy
	 */
	if(config.auth.strategy === 'local') {

		logger.info('Configuring local user authentication routes.');

		/**
		 * @swagger
	 	 * /admin/user:
	 	 *   strategy: local
	 	 *   post:
	 	 *     tags: [auth]
	 	 *     description: Creates a new user.
	 	 *     parameters:
	 	 *     - in: body
	 	 *       name: body
	 	 *       required: true
	 	 *       schema:
	 	 *         $ref: '#/definitions/AdminUpdateUserDto'
	 	 */
		app.route('/admin/user')
			.post(users.hasAdminAccess, users.adminCreateUser);

		// Default setup is basic local auth
		app.route('/auth/signup').post(users.signup);

		app.route('/auth/forgot').post(users.forgot);
		app.route('/auth/reset/:token').get(users.validateResetToken);
		app.route('/auth/reset/:token').post(users.reset);

	}
	/**
	 * Routes that only apply to the 'proxy-pki' passport strategy
	 */
	else if(config.auth.strategy === 'proxy-pki') {

		logger.info('Configuring proxy-pki user authentication routes.');

		// Admin Create User
		app.route('/admin/user')
			.post(users.hasAdminAccess, users.adminCreateUserPki);

		// DN passed via header from proxy
		app.route('/auth/signup').post(users.proxyPkiSignup);

	}

	// Finish by binding the user middleware
	app.param('userId', users.userById);
};

// Swagger Definitions

/**
 * @swagger
 * definitions:
 *   AdminUpdateUserDto:
 *     type: object
 *     required: [name, organization, username, email]
 *     properties:
 *       name:
 *         type: string
 *       organization:
 *         type: string
 *       username:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *   NonAdminUpdateUserDto:
 *     allOf:
 *     - $ref: '#/definitions/AdminUpdateUserDto'
 *     - properties:
 *         currentPassword:
 *           type: string
 *   QueryAndSearchBody:
 *     type: object
 *     required: [s]
 *     properties:
 *       q:
 *         type: object
 *       s:
 *         type: string
 */