'use strict';

const
	_ = require('lodash'),
	mongoose = require('mongoose'),
	should = require('should'),

	schemaService = require('./schema.server.service');

describe('Schema Service', () => {

	describe('pageable plugin', () => {

		let TestObject;

		/*
		 * Create the TestObjectSchema to use for the pageable tests
		 */
		before(() => {
			const TestObjectSchema = new schemaService.GetterSchema({
				content: { type: String }
			});
			TestObjectSchema.plugin(schemaService.pageable);
			TestObjectSchema.index({ content: 'text' });
			mongoose.model('TestObject', TestObjectSchema, 'testobjects');
			TestObject = mongoose.model('TestObject', 'testobjects');
		});

		after(() => {
			return TestObject.collection.drop();
		});

		const specs = [{
			content: 'How many chucks would a woodchuck chuck if a woodchuck could chuck wood?'
		}, {
			content: 'How many roads must a man walk down before you can call him a man?'
		}, {
			content: 'Johnny\'s in the basement mixing up the medicine'
		}];

		const verifyCount = (expectedCount) => {
			return TestObject.count().then((count) => {
				should(count).eql(expectedCount);
			});
		};

		it('should start with no test objects', () => {
			return verifyCount(0);
		});

		it('should add and count 3 test objects', () => {
			return Promise.all(_.map(specs, (spec) => {
				return new TestObject(spec).save();
			})).then(() => {
				return verifyCount(3);
			});
		});

		it('should use pageable plugin to return paged list', () => {
			return TestObject.pagingSearch({
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
			return TestObject.pagingSearch({
				searchTerms: 'basement'
			}).then((results) => {
					should.exist(results);
					should(results.totalSize).eql(1);
					should(results.pageNumber).eql(0);
					should(results.elements).be.a.Array();
					should(results.elements).have.length(1);
					should(results.elements[0].content).eql(specs[2].content);
				});
		});

	});

	describe('GetterSchema', () => {
		it('test getter schema'); // pending
	});

});
