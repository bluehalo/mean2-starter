'use strict';

var
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	logger = deps.logger,

	accessChecker = require(path.resolve('./src/server/app/access-checker/services/access-checker.server.service.js')),
	CacheEntry = dbs.admin.model('CacheEntry');


module.exports.run = function(svcConfig) {
	logger.debug('Access Checker: Checking cached users...');

	var refresh = svcConfig.refresh || 8*3600000; // default to 12 hours

	// Create a defer for the response
	var defer = q.defer();

	// Find all the keys that need to be refreshed
	CacheEntry.find({ ts: { $lt: Date.now() - refresh } }).exec(function (error, results) {
		if(null != error) {
			defer.reject(error);
		} else {
			if(results.length > 0) {
				logger.info('Access Checker: Refreshing %s users', results.length);
			}

			// Iterate through each object, refreshing as you go
			var defers = [];
			results.forEach(function(e) {
				logger.debug('Access Checker: Refreshing %s', e.key);
				defers.push(accessChecker.refreshEntry(e.key));
			});

			q.all(defers).then(defer.resolve, defer.reject).done();
		}
	});

	// return the promise
	return defer.promise;
};
