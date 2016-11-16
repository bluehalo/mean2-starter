'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService;

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require(path.resolve('./src/server/app/admin/controllers/users/users.authentication.server.controller.js')),
	require(path.resolve('./src/server/app/admin/controllers/users/users.authorization.server.controller.js')),
	require(path.resolve('./src/server/app/admin/controllers/users/users.password.server.controller.js')),
	require(path.resolve('./src/server/app/admin/controllers/users/users.profile.server.controller.js')),
	require(path.resolve('./src/server/app/admin/controllers/users/users.export.server.controller.js')),
	require(path.resolve('./src/server/app/admin/controllers/users/eua.server.controller.js')),
	require(path.resolve('./src/server/app/admin/controllers/users/preferences.notifications.server.controller.js'))
);

/*=====================================
 * Auth Middleware
 *====================================*/

/**
 * Apply the auth requirements as authorization middleware
 * @param requirement The requirement function to invoke
 */
module.exports.has = function(requirement) {

	// Return a function that adapts the requirements to middleware
	return function(req, res, next) {
		requirement(req).then(function(result) {
			next();
		}, function(errorResult) {
			util.handleErrorResponse(res, errorResult);
		}).done();
	};
};

/**
 * Apply the array of auth functions in order, using AND logic
 */
module.exports.hasAll = function() {
	var requirements = arguments;
	return function(req, res, next) {
		module.exports.requiresAll(requirements)(req).then(function(result) {
			next();
		}, function(errorResult) {
			util.handleErrorResponse(res, errorResult);
		}).done();
	};
};

module.exports.requiresAll = function(requirements) {
	return function(req) {

		// Apply the requirements
		var applyRequirement = function(i) {
			if(i < requirements.length) {
				return requirements[i](req).then(function(result) {
					// Success means try the next one
					return applyRequirement(++i);
				});
			} else {
				// Once they all pass, we're good
				return q();
			}
		};

		return applyRequirement(0);
	};
};

/**
 * Apply the array of auth functions in order, using OR logic
 */
module.exports.hasAny = function() {
	var requirements = arguments;
	return function(req, res, next) {
		module.exports.requiresAny(requirements)(req).then(function(result) {
			next();
		}, function(errorResult) {
			util.handleErrorResponse(res, errorResult);
		}).done();
	};
};

module.exports.requiresAny = function(requirements) {
	return function(req) {

		// Apply the requirements
		var error;
		var applyRequirement = function(i) {
			if(i < requirements.length) {
				return requirements[i](req).then(function(result) {
					// Success means we're done
					return q();
				}, function(errorResult) {
					// Failure means keep going
					error = errorResult;
					return applyRequirement(++i);
				});
			} else {
				// If we run out of requirements, fail with the last error
				return q.reject(error);
			}
		};

		if(requirements.length > 0) {
			return applyRequirement(0);
		}
		else {
			// Nothing to check passes
			return q();
		}
	};
};


/**
 * Checks that the user has base access
 * 	1. The user is logged in
 * 	2. The user has accepted the EUA if applicable
 * 	3. The user has the 'user' role
 */
module.exports.hasAccess = function(req, res, next) {
	module.exports.hasAll(
			module.exports.requiresLogin,
			module.exports.requiresEua,
			module.exports.requiresUserRole,
			module.exports.requiresExternalRoles
			)(req, res, next);
};

/**
 * Checks that the user has editor access
 * 	1. The user has met the base access requirements
 * 	2. The user has the 'editor' role
 */
module.exports.hasEditorAccess = function(req, res, next) {
	module.exports.hasAll(
			module.exports.requiresLogin,
			module.exports.requiresEua,
			module.exports.requiresUserRole,
			module.exports.requiresExternalRoles,
			module.exports.requiresEditorRole
			)(req, res, next);
};

/**
 * Checks that the user has auditor access
 * 	1. The user has met the base access requirements
 * 	2. The user has the 'auditor' role
 */
module.exports.hasAuditorAccess = function(req, res, next) {
	module.exports.hasAll(
			module.exports.requiresLogin,
			module.exports.requiresEua,
			module.exports.requiresUserRole,
			module.exports.requiresExternalRoles,
			module.exports.requiresAuditorRole
			)(req, res, next);
};

/**
 * Checks that the user has admin access
 * 	1. The user has met the base access requirements
 * 	2. The user has the 'admin' role
 */
module.exports.hasAdminAccess = function(req, res, next) {
	module.exports.hasAll(
			module.exports.requiresLogin,
			module.exports.requiresAdminRole
			)(req, res, next);
};

