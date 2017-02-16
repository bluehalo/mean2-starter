'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	logger = deps.logger,

	User = dbs.admin.model('User'),
	notificationService = require(path.resolve('./src/server/app/notifications/services/notification.server.service.js'));

/**
 * Clean up orphaned notifications (referenced user no longer exists)
 */
module.exports.run = function() {

	return notificationService.searchAll({})
		.then((notifications) => {
			if (_.isArray(notifications)) {
				let userPromises = notifications.map((notification) => User.findById(notification.user));
				return q.all(userPromises)
					.then((users) => {
						let removals = [];
						users.forEach((user, idx) => {
							if (!user) {
								let notification = notifications[idx];
								logger.debug(`Removing notification=${notification._id} owned by nonexistent user=${notification.user}`);
								removals.push(notification.remove());
							}
						});
						return q.all(removals);
					});
			}
			return q();
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to clean up orphaned notifications. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
