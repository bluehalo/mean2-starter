'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,

	userProfileService = require(path.resolve('./src/server/app/admin/services/users.profile.server.service.js')),
	userAuthService = require(path.resolve('./src/server/app/admin/services/users.authentication.server.service.js')),
	User = dbs.admin.model('User');



/**
 * Exposed API
 */

// User middleware - stores user corresponding to id in 'userParam'
module.exports.userById = (req, res, next, id) => {
	userProfileService.userById(id)
		.then((user) => {
			req.userParam = user;
			next();
		}, (err) => {
			next(err);
		});
};


/**
 * Require an authenticated user
 */
module.exports.requiresLogin = (req) => {
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
module.exports.requiresRoles = (roles, rejectStatus) => {
	rejectStatus = rejectStatus || { status: 403, type: 'missing-roles', message: 'User is missing required roles' };

	return (req) => {
		if (User.hasRoles(req.user, roles)) {
			return q();
		} else {
			return q.reject(rejectStatus);
		}
	};

};

//Detects if the user has the user role
module.exports.requiresUserRole = (req) => {
	return module.exports.requiresRoles(
			['user'],
			{ status: 403, type: 'inactive', message: 'User account is inactive'}
		)(req);
};

//Detects if the user has the editor role
module.exports.requiresEditorRole = (req) => {
	return module.exports.requiresRoles(['editor'])(req);
};

//Detects if the user has the auditor role
module.exports.requiresAuditorRole = (req) => {
	return module.exports.requiresRoles(['auditor'])(req);
};

// Detects if the user has admin role
module.exports.requiresAdminRole = (req) => {
	return module.exports.requiresRoles(['admin'])(req);
};

// Checks to see if all required external roles are accounted for
module.exports.requiresExternalRoles = (req) => {
	let promise;

	// If there are required roles, check for them
	if(req.user.bypassAccessCheck === false && null != config.auth && _.isArray(config.auth.requiredRoles) && config.auth.requiredRoles.length > 0) {

		// Get the user roles
		let userRoles = (null != req.user && _.isArray(req.user.externalRoles))? req.user.externalRoles : [];

		// Reject if the user is missing required roles
		if (_.difference(config.auth.requiredRoles, userRoles).length > 0) {
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
