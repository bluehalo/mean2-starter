'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	logger = deps.logger,

	User = dbs.admin.model('User'),
	userService = require(path.resolve('./src/server/app/admin/services/users.profile.server.service.js'));

/**
 * Clean up orphaned preferences (referenced user no longer exists)
 */
module.exports.run = function(config) {

	return userService.searchAll([{lastLogin: { $lt: Date.now()-config.first}}, {lastLogin: {$lt: Date.now() - config.second}}, {lastLogin: { $lt: Date.now() - config.third}}])
		.then((users) => {
			if (_.isArray(users)) {
				logger.info(users[0]);
				// users[1];
				// users[2];
			}
			return q.all(users);
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to remove inactive users. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
