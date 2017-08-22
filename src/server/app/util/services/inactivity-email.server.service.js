'use strict';

let path = require('path'),
	q = require('q'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	logger = deps.logger,
	userService = require(path.resolve('./src/server/app/admin/services/users.profile.server.service.js'));

module.exports.run = function(config) {
	logger.info('hello');
	return userService.searchAll({})
		.then((user) => {
			logger.info(user);
		})
		.fail((err) => {
			logger.error(`Failed search for users with inactive accounts. Error=${JSON.stringify(err)}`);
			return q(err);
		});

};
