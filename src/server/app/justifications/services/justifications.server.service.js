'use strict';

let
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	util = deps.utilService,
	Justification = dbs.admin.model('Justification'),
	User = dbs.admin.model('User');

module.exports = function() {

	/**
	 * Creates a new justification entry with the requested document schema, unless it already
	 * exists, in which case it's just "touched".
	 *
	 * Promise contains 'null' on successful insertion of new document, or the updated document
	 * on an updated document state change.
	 *
	 * @param justificationInfo
	 * @returns {Promise<TResult>|Promise.<TResult>}
	 */
	function createJustification(justificationInfo) {
		let ownerId = justificationInfo.owner;

		return User.findOne({_id: ownerId}).exec()
			.then((user) => {
				if (null == user) {
					return q.reject({status: 400, type: 'bad-request', message: 'Invalid user specified'});
				}

				// see if justification's text already exists and if so, just update it
				let query = { text: justificationInfo.text, owner: user};
				return Justification.findOneAndUpdate(query, {$set: {updated: Date.now()}}, {upsert: true}).exec();
			});
	}

	/**
	 * Updates the "updated" field of the given justification
	 *
	 * @param justification
	 * @returns {Promise|undefined|*}
	 */
	function touchJustification(justification) {
		justification.updated = Date.now();

		let ownerId = justification.owner;

		return User.findOne({_id: ownerId}).exec()
			.then((user) => {
				if (null == user) {
					return q.reject({status: 400, type: 'bad-request', message: 'Invalid user specified'});
				}
				else {
					return justification.save();
				}
			});
	}

	function searchJustifications(search, query, queryParams) {
		let page = util.getPage(queryParams);
		let limit = util.getLimit(queryParams);

		let offset = page * limit;

		// Default: return results in order of most to least recent
		let sortArr = [{property: 'updated', direction: 'DESC'}];
		if (null != queryParams.sort && null != queryParams.dir) {
			sortArr = [{property: queryParams.sort, direction: queryParams.dir}];
		}

		return Justification.search(query, search, limit, offset, sortArr)
			.then(function(result) {
				if (null == result) {
					return q({
						totalSize: 0,
						elements: []
					});
				}
				else {
					return q({
						totalSize: result.count,
						elements: result.results
					});
				}
			});

	}

	return {
		createJustification: createJustification,
		touchJustification: touchJustification,
		searchJustifications: searchJustifications
	};
};