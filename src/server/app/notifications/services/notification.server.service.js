'use strict';

let path = require('path'),
	q = require('q'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	dbs = deps.dbs,
	Notification = dbs.admin.model('Notification');

module.exports.searchAll = function(query) {
	return Notification.find(query).exec();
};


module.exports.search = function(query, queryParams, user) {
	if (!user || !user._id) {
		return q.reject('Notification Service: user._id must be defined');
	}

	if (!query) {
		query = {};
	}

	// Always need to filter by user making the service call
	query.user = user._id;

	let page = util.getPage(queryParams);
	let limit = util.getLimit(queryParams, 1000);

	let sort = queryParams.sort;
	let dir = queryParams.dir;

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if (sort && !dir) { dir = 'ASC'; }

	let sortParams;
	if (sort) {
		sortParams = {};
		sortParams[sort] = dir === 'ASC' ? 1 : -1;
	}

	return Notification.pagingSearch({
		query: query,
		sorting: sortParams,
		page: page,
		limit: limit
	});

};
