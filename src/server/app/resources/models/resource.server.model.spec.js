'use strict';

/**
 * Module dependencies.
 */
let
	path = require('path'),
	q = require('q'),
	should = require('should'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,

	Owner = dbs.admin.model('Owner'),
	TeamOwner = dbs.admin.model('TeamOwner'),
	Resource = dbs.admin.model('Resource');

/**
 * Globals
 */
function clearDatabase() {
	return q.all([
		Resource.remove(),
		Owner.remove()
	]);
}

let owner1;
let resource1;

let spec = {
	resource1: {
		title: 'Title'
	},
	owner1: {
	}
};

/**
 * Unit tests
 */
describe('Resource Model:', function() {
	before(function(done) {
		return clearDatabase()
			.then(function() {
				resource1 = new Resource(spec.resource1);
				owner1 = new TeamOwner({});
				done();
			}, done).done();
	});

	after(function(done) {
		clearDatabase()
			.then(function() {
				done();
			}, done).done();
	});

	describe('Method Save', function() {
		it('should begin with no resources', function(done) {
			Resource.find({}).exec()
				.then(function(resources) {
					resources.should.have.length(0);
					done();
				}, done);
		});

		it('should be able to save resource without problems', function(done) {
			resource1.owner = owner1;
			resource1.save(done);
		});

		it('should have one resource', function(done) {
			Resource.find({}).exec()
				.then(function(resources) {
					resources.should.have.length(1);
					done();
				}, done);
		});

		it('should fail when trying to save without a title', function(done) {
			resource1.title = '';
			resource1.owner = owner1;
			resource1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should fail when trying to save without an owner', function(done) {
			resource1.title = '';
			resource1.save(function(err) {
				should.exist(err);
				done();
			});
		});

	});

});
