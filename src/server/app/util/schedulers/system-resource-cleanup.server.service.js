'use strict';

let path = require('path'),
	q = require('q'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	logger = deps.logger;

	let services = [
		{
			path: require(path.resolve('./src/server/app/preferences/schedulers/preference-cleanup.server.service.js')),
			name: 'preference-cleanup'
		}
	];

module.exports.run = function() {
	let cleanups = services.map((service) => service.path.run());
	return q.allSettled(cleanups)
		.then((results) => {
			results.forEach((result, idx) => {
				if (result.state === 'rejected') {
					logger.error(`Error running service=${services[idx].name}. Error=${JSON.stringify(result.reason)}`);
				} else {
					logger.debug(`Ran service=${services[idx].name} during system-resource-cleanup`);
				}
			});

		});
};
