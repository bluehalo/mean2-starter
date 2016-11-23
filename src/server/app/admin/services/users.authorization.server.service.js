'use strict';

var _ = require('lodash');


/**
 * ==========================================================
 * Private methods
 * ==========================================================
 */



/**
 * ==========================================================
 * Public Methods
 * ==========================================================
 */

module.exports.checkExternalRoles = function(user, configAuth) {
	// If there are required roles, check for them
	if (null != configAuth && _.isArray(configAuth.requiredRoles) && configAuth.requiredRoles.length > 0) {
		// Get the user roles
		var userRoles = (null != user && _.isArray(user.externalRoles)) ? user.externalRoles : [];
		if(_.difference(configAuth.requiredRoles, userRoles).length > 0) {
			return false;
		}
	}
	return true;
};