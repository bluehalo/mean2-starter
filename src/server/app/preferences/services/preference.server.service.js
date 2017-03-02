'use strict';

let path = require('path'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	dbs = deps.dbs,
	Preference = dbs.admin.model('Preference');

module.exports.searchAll = function(query) {
	return Preference.find(query).exec();
};

module.exports.search = function(query, queryParams) {
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

	return Preference.pagingSearch({
		query: query,
		sorting: sortParams,
		page: page,
		limit: limit
	});
};
