'use strict';

let
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	logger = deps.logger,

	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));


module.exports = (app) => {

	/**
	 * User Routes (don't require admin)
	 */

	// Self-service user routes
	app.route('/user/me')
		.get( users.has(users.requiresLogin), users.getCurrentUser)
		.post(users.has(users.requiresLogin), users.updateCurrentUser);

	// User getting another user's info
	app.route('/user/:userId')
		.get(users.hasAccess, users.getUserById);

	// User searching for other users
	app.route('/users')
		.post(users.hasAccess, users.searchUsers);

	// User match-based search for other users (this searches based on a fragment)
	app.route('/users/match')
		.post(users.hasAccess, users.matchUsers);

	/**
	 * Notification Preferences Routes
	 */

	app.route('/users/me/preferences/notifications/:notificationType/:referenceId')
		.get(users.hasAccess, users.getNotificationPreferencesByTypeAndId)
		.post(users.hasAccess, users.setNotificationPreferencesByTypeAndId);

	/**
	 * Admin User Routes (requires admin)
	 */

	// Admin retrieve/update/delete
	app.route('/admin/user/:userId')
		.get(   users.hasAdminAccess, users.adminGetUser)
		.post(  users.hasAdminAccess, users.adminUpdateUser)
		.delete(users.hasAdminAccess, users.adminDeleteUser);

	// Admin search users
	app.route('/admin/users')
		.post(users.hasAdminAccess, users.adminSearchUsers);

	// Get user CSV using the specifies config id
	app.route('/admin/users/csv/:exportId')
		.get(users.hasAdminAccess, users.adminGetCSV);

	// Admin retrieving a User field for all users in the system
	app.route('/admin/users/getAll')
		.post(users.hasAdminAccess, users.adminGetAll);

	/**
	 * Auth-specific routes
	 */
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout')
		.get(users.has(users.requiresLogin), users.signout);

	/**
	 * Routes that only apply to the 'local' passport strategy
	 */
	if (config.auth.strategy === 'local') {

		logger.info('Configuring local user authentication routes.');

		// Admin Create User
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
	else if (config.auth.strategy === 'proxy-pki') {

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
