'use strict';

var _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,

	userAuthService = require(path.resolve('./src/server/app/admin/services/users.authentication.server.service.js')),
	User = dbs.admin.model('User');



/**
 * Exposed API
 */

// User middleware - stores user corresponding to id in 'userParam'
module.exports.userById = function(req, res, next, id) {
	User.findOne({
		_id: id
	}).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.userParam = user;
		next();
	});
};


/**
 * Require an authenticated user
 */
module.exports.requiresLogin = function(req) {
	if (req.isAuthenticated()) {
		return q();
	} else {

		// Only try to auto login if it's explicitly set in the config
		if(config.auth.autoLogin) {
			return userAuthService.authenticateAndLogin(req);
		}
		// Otherwise don't
		else {
			return q.reject({ status: 401, type: 'no-login', message: 'User is not logged in' });
		}
	}
};

/**
 * Require the passed roles
 */
module.exports.requiresRoles = function(roles, rejectStatus) {
	rejectStatus = rejectStatus || { status: 403, type: 'missing-roles', message: 'User is missing required roles' };

	return function(req) {
		if (User.hasRoles(req.user, roles)) {
			return q();
		} else {
			return q.reject(rejectStatus);
		}
	};

};

//Detects if the user has the user role
module.exports.requiresUserRole = function(req) {
	return module.exports.requiresRoles(
			['user'],
			{ status: 403, type: 'inactive', message: 'User account is inactive'}
		)(req);
};

//Detects if the user has the editor role
module.exports.requiresEditorRole = function(req) {
	return module.exports.requiresRoles(['editor'])(req);
};

//Detects if the user has the auditor role
module.exports.requiresAuditorRole = function(req) {
	return module.exports.requiresRoles(['auditor'])(req);
};

// Detects if the user has admin role
module.exports.requiresAdminRole = function(req) {
	return module.exports.requiresRoles(['admin'])(req);
};

// Checks to see if all required external roles are accounted for
module.exports.requiresExternalRoles = function(req) {
	var promise;

	// If there are required roles, check for them
	if(req.user.bypassAccessCheck === false && null != config.auth && _.isArray(config.auth.requiredRoles) && config.auth.requiredRoles.length > 0) {

		// Get the user roles
		var userRoles = (null != req.user && _.isArray(req.user.externalRoles))? req.user.externalRoles : [];

		// Reject if the user is missing required roles
		if(_.difference(config.auth.requiredRoles, userRoles).length > 0) {
			promise = q.reject({ status: 403, type: 'noaccess', message: 'User is missing required roles' });
		}
		// Resolve if they had all the roles
		else {
			promise = q();
		}

	}
	// Resolve if we don't need to check
	else {
		promise = q();
	}

	return promise;
};
