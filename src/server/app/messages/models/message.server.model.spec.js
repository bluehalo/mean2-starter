'use strict';

const _ = require('lodash'),
	path = require('path'),
	should = require('should'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,

	Message = dbs.admin.model('Message');

const clearDB = () => {
	return Promise.all([
		Message.remove()
	]);
};

describe('Message Model', () => {
	before(() => {
	});

	after(() => {
		return clearDB();
	});

	const messageSpec = {
		title: 'Test Title',
		body: 'Test Body',
		type: 'INFO'
	};

	const verifyCount = (expectedCount) => {
		return Message.count().then((count) => {
			should(count).eql(expectedCount);
		});
	};

	it('should start with no messages', () => {
		return verifyCount(0);
	});

	it('should add and count 3 messages', () => {
		return Promise.all(_.times(3, () => {
			return new Message(messageSpec).save();
		})).then(() => {
			return verifyCount(3);
		});
	});

	it('should use countSearchable plugin to return paged list', () => {
		const query = {}, sortParams = [], page = 0, limit = 2;
		return Message.countSearch(query, sortParams, page, limit)
			.then((results) => {
				should.exist(results);
				should(results.totalSize).eql(3);
				should(results.pageNumber).eql(0);
				should(results.pageSize).eql(2);
				should(results.totalPages).eql(2);
				should(results.elements).be.a.Array();
				should(results.elements).have.length(2);
			});
	});

});
