'use strict';

let path = require('path'),
	q = require('q'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	logger = deps.logger;

let services = [
	{
		path: require(path.resolve('./src/server/app/util/services/inactive-user-email.server.service.js')),
		name: 'inactive-user-notification'
	}
];

module.exports.run = function(config) {

	let notifyInactiveUsers = services.map((service) => service.path.run(config));
	return q.allSettled(notifyInactiveUsers)
		.then((results) => {
			results.forEach((result, idx) => {
				if (result.state === 'rejected') {
					logger.error(`Error running service=${services[idx].name}. Error=${JSON.stringify(result.reason)}`);
				} else {
					logger.debug(`Ran service=${services[idx].name} to email inactive users`);
				}
			});

		});
};

