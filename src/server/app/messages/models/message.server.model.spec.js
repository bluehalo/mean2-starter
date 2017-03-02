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

	const messageSpecs = [{
		title: 'Led Zeppelin',
		body: 'Jimmy Page and Robert Plant',
		type: 'INFO'
	}, {
		title: 'The Jimi Hendrix Experience',
		body: 'Jimi Hendrix',
		type: 'INFO'
	}, {
		title: 'Trans Siberian Orchestra',
		body: 'A bunch of cool people',
		type: 'INFO'
	}];

	const verifyCount = (expectedCount) => {
		return Message.count().then((count) => {
			should(count).eql(expectedCount);
		});
	};

	it('should start with no messages', () => {
		return verifyCount(0);
	});

	it('should add and count 3 messages', () => {
		return Promise.all(_.map(messageSpecs, (messageSpec) => {
			return new Message(messageSpec).save();
		})).then(() => {
			return verifyCount(3);
		});
	});

	it('should use countSearchable plugin to return paged list', () => {
		return Message.pagingSearch({
			query: {},
			sorting: [],
			page: 0,
			limit: 2
		}).then((results) => {
				should.exist(results);
				should(results.totalSize).eql(3);
				should(results.pageNumber).eql(0);
				should(results.pageSize).eql(2);
				should(results.totalPages).eql(2);
				should(results.elements).be.a.Array();
				should(results.elements).have.length(2);
			});
	});

	it('should find one by text search', () => {
		return Message.pagingSearch({
			searchTerms: 'siberian'
		}).then((results) => {
				should.exist(results);
				should(results.totalSize).eql(1);
				should(results.pageNumber).eql(0);
				should(results.elements).be.a.Array();
				should(results.elements).have.length(1);
				const firstResult = results.elements[0];
				const actual = _.pick(firstResult, ['title', 'body', 'type']);
				should(actual).eql(messageSpecs[2]);
			});
	});

	it('should project subset of fields', () => {
		return Message.pagingSearch({
			projection: {
				title: 1,
				body: 1,
				_id: 0
			}
		}).then((results) => {
				should.exist(results);
				should(results.totalSize).eql(3);
				should(results.pageNumber).eql(0);
				should(results.elements).be.a.Array();
				should(results.elements).have.length(3);

				const expectedResults = _.map(messageSpecs, (m) => {
					return _.pick(m, ['title', 'body']);
				});

				_.forEach(results.elements, (elem) => {
					should(_.has(elem, 'type')).eql(false); // type should have been excluded
					const actual = _.pick(elem, ['title', 'body']);
					const found = _.some(expectedResults, (expected) => {
						return _.isEqual(expected, actual);
					});
					should(found).eql(true);
				});

			});
	});

});
