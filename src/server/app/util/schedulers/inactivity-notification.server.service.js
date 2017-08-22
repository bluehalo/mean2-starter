'use strict';

let path = require('path'),
	q = require('q');
	// deps = require(path.resolve('./src/server/dependencies.js')),
	// logger = deps.logger;
	// User = dbs.admin.model('User'),
	// queryMongoService = require(path.resolve('./src/server/app/util/services/query.server.service.js'));

let services = [
	{
		path: require(path.resolve('./src/server/app/util/services/inactivity-email.server.service.js')),
		name: 'inactivity notification'
	}
];

module.exports.run = function(config) {
	// let users = services.map((service) => service.path.getAllByIdAsMap(User, userIds, ['lastLogin'], false));
	services.map((service) => service.path.run());
	return q();
};
