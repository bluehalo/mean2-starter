'use strict';

let path = require('path'),

	projects = require(path.resolve('./src/server/projects/controllers/projects.server.controller.js')),
	users = require(path.resolve('./src/server/users/controllers/users.server.controller.js'));

module.exports = function(app) {

	/**
	 * Project Routes
	 */

	app.route('/project')
		.put(users.hasAccess, users.hasAny(users.requiresAdminRole, projects.requiresEditor), projects.create);

	app.route('/projects')
		.post(users.hasAccess, projects.search);

	app.route('/project/:projectId')
		.get(   users.hasAccess, users.hasAny(users.requiresAdminRole, projects.requiresMember), projects.read)
		.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, projects.requiresEditor), projects.update)
		.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, projects.requiresEditor), projects.delete);


	// Finish by binding the project middleware
	app.param('projectId', projects.projectById);
};
