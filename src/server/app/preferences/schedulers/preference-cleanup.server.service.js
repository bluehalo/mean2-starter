'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	logger = deps.logger,

	User = dbs.admin.model('User'),
	preferenceService = require(path.resolve('./src/server/app/preferences/services/preference.server.service.js'));

/**
 * Clean up orphaned preferences (referenced user no longer exists)
 */
module.exports.run = function() {

	return preferenceService.searchAll({})
		.then((preferences) => {
			if (_.isArray(preferences)) {
				let userPromises = preferences.map((preference) => User.findById(preference.user));
				return q.all(userPromises)
					.then((users) => {
						let removals = [];
						users.forEach((user, idx) => {
							if (user == null) {
								let preference = preferences[idx];
								logger.debug(`Removing preference=${preference._id} owned by nonexistent user=${preference.user}`);
								removals.push(preference.remove());
							}
						});
						return q.all(removals);
					});
			}
			return q();
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to clean up orphaned preferences. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
