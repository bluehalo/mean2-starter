'use strict';

var mongoose = require('mongoose'),
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
 * Adds a static method 'countSearch' to the schema that performs concurrent
 * count and search queries, returning the results in the project's standard
 * pagination format
 */
const countSearchable = (schema) => {

	schema.statics.countSearch = function(query, sortParams, page, limit) {
		let countPromise = this.find(query).count();
		let searchPromise = this.find(query);

		if (sortParams) {
			searchPromise = searchPromise.sort(sortParams);
		}

		if (limit) {
			searchPromise = searchPromise.skip(page * limit).limit(limit);
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
	countSearchable: countSearchable,
	GetterSchema: GetterSchema
};
