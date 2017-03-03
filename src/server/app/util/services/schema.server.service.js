'use strict';

const _ = require('lodash'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Instructs Mongoose to use getters for the toObject and toJSON methods
 * for an input schema definition
 */
const GetterSchema = function (add) {
	var schema = new Schema(add);

	schema.set('toObject', { getters: true });
	schema.set('toJSON', { getters: true });

	return schema;
};

/**
 * Translates the input sort array to an object with the properties specified.
 * Defaults to descending sort on each property
 */
const generateSort = (sorting) => {

	if(_.isArray(sorting)) {
		var sortObj = {};

		// Extract the sort instructions with defaults for DESC sort on each property
		_.forEach(sorting, (d) => {
			if(!_.isEmpty(d) && !_.isEmpty(d.property)) {
				sortObj[d.property] = (d.direction === 'ASC')? 1 : -1;
			}
		});

		return sortObj;
	}

	/*
	 * Otherwise, if it is not an array, assume that the value passed-in is
	 * a sorting object that the caller expected to be sent directly to the query
	 */
	return sorting;

};

/**
 * Adds a static method 'pagingSearch' to the schema that performs concurrent
 * count and search queries, returning the results in the project's standard
 * pagination format.
 *
 * Options are:
 * - query (default: {})
 * - projection (default: {})
 * - options (default: {})
 * - searchTerms (optional)
 * - sorting (default: {})
 * - page (default: 0)
 * - limit (optional)
 * - maxScan (optional)
 */
const pageable = (schema) => {

	/**
	 * Called in the scope of the Mongoose Schema that is invoked
	 * in order to reference it by "this"
	 */
	schema.statics.pagingSearch = function(searchConfig) {

		const query = _.get(searchConfig, 'query', {}),
			projection = _.get(searchConfig, 'projection', {}),
			options = _.get(searchConfig, 'options', {}),
			searchTerms = _.get(searchConfig, 'searchTerms', null),
			sortParams = _.get(searchConfig, 'sorting', {}),
			page = _.get(searchConfig, 'page', 0),
			limit = _.get(searchConfig, 'limit', null),
			maxScan = _.get(searchConfig, 'maxScan', null);

		const sort = generateSort(sortParams);

		/*
		 * If the searchTerms is provided, then build the
		 * text search and sort by its score
		 */
		if (!_.isEmpty(searchTerms)) {
			query.$text = { $search: searchTerms };
			projection.score = { $meta: 'textScore' };

			// Sort by textScore last if there is a searchTerms
			sort.score = { $meta: 'textScore' };
		}

		let countPromise = this.count(query),
			searchPromise = this.find(query, projection, options).sort(sort);

		if (limit) {
			searchPromise = searchPromise.skip(page * limit).limit(limit);
		}

		if (maxScan) {
			searchPromise = searchPromise.maxscan(maxScan);
		}

		return Promise.all([ countPromise, searchPromise ])
			.then((results) => {
				return {
					totalSize: results[0],
					pageNumber: page,
					pageSize: limit,
					totalPages: Math.ceil(results[0] / limit),
					elements: results[1]
				};
			});
	};

};

module.exports = {
	pageable: pageable,
	GetterSchema: GetterSchema
};
