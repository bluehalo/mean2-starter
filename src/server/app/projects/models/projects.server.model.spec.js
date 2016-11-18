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

	Project = dbs.admin.model('Project'),
	Team = dbs.admin.model('Team');

/**
 * Globals
 */
function clearDatabase() {
	return q.all([
		Project.remove(),
		Team.remove()
	]);
}

let project1;

let spec = {
	user1: {
		name: 'User 1',
		email: 'user1@mail.com',
		username: 'user1',
		password: 'password',
		provider: 'local'
	},
	team1: {
		name: 'Title',
		description: 'Description'
	},
	project1: {
		name: 'Project 1',
		description: 'Description 3'
	}
};

/**
 * Unit tests
 */
describe('Project Model:', function() {
	let team = {};

	before(function(done) {
		return clearDatabase().then(function() {
			new Team(spec.team1).save().then(function(t) {
				team = t;

				spec.project1.owner = team;

				project1 = new Project(spec.project1);
			});

			done();
		}, done).done();
	});

	after(function(done) {
		clearDatabase().then(function() {
			done();
		}, done).done();
	});

	describe('Method Save', function() {
		it('should begin with no projects', function(done) {
			Project.find({}).exec().then(function(projects) {
				projects.should.have.length(0);
				done();
			}, done);
		});

		it('should be able to save without problems', function(done) {
			project1.save(done);
		});


		it('should fail when trying to save without a name', function(done) {
			project1.name = '';
			project1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should fail when trying to save with an invalid owner', function(done) {
			project1.owner = 'badowner';
			project1.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});
});
