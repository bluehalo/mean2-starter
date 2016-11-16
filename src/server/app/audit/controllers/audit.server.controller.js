'use strict';

var
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	logger = deps.logger,
	util = deps.utilService,

	Audit = dbs.admin.model('Audit');

/**
 * Retrieves the distinct values for a field in the Audit collection
 */
exports.getDistinctValues = function(req, res) {
	var fieldToQuery = req.query.field;

	Audit.distinct(fieldToQuery, {}).exec(function(err, results) {
		if(null != err) {
			// failure
			logger.error({err: err, req: req}, 'Error finding distinct values');
			return util.send400Error(res, err);
		}

		res.json(results);
	});
};

exports.search = function(req, res) {
	var search = req.body.s || null;
	var query = req.body.q || {};
	query = util.toMongoose(query);

	// Get the limit provided by the user, if there is one.
	// Limit has to be at least 1 and no more than 100.
	var limit = Math.floor(req.query.size);
	if (null == limit || isNaN(limit)) {
		limit = 20;
	}
	limit = Math.max(1, Math.min(100, limit));

	// default sorting by ID
	var sortArr = [{ property: '_id', direction: 'DESC' }];
	if(null != req.query.sort && null != req.query.dir) {
		sortArr = [{ property:  req.query.sort, direction: req.query.dir }];
	}

	// Page needs to be positive and has no upper bound
	var page = req.query.page;
	if (null == page){
		page = 0;
	}
	page = Math.max(0, page);

	var offset = page * limit;

	Audit.search(query, search, limit, offset, sortArr).then(function(result) {
		// success
		var toReturn = {
			hasMore: result.count > result.results.length,
			elements: result.results,
			totalSize: result.count,
			pageNumber: page,
			pageSize: limit,
			totalPages: Math.ceil(result.count / limit)
		};

		// Serialize the response
		res.status(200).json(toReturn);
	}, function(err) {
		// failure
		logger.error({err: err, req: req}, 'Error searching for audit entries');
		return util.handleErrorResponse(res, err);
	});
};
