'use strict';

let path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	User = dbs.admin.model('User'),
	logger = deps.logger;


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

module.exports.userById = (id) => {
	let defer = q.defer();

	User.findOne({
		_id: id
	}).exec((err, user) => {
		if (err) {
			defer.reject(err);
		} else if (!user) {
			defer.reject(new Error('Failed to load User ' + id));
		} else {
			defer.resolve(user);
		}
	});

	return defer.promise;
};

module.exports.searchAll = function(query) {
	return User.find(query).exec();
};
