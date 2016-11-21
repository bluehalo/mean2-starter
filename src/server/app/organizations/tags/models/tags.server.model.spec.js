'use strict';

require('./tags.server.model');
require('../../teams/models/team.server.model');

/**
 * Module dependencies.
 */
let
	path = require('path'),
	q = require('q'),
	should = require('should'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,

	Tag = dbs.admin.model('Tag'),
	Team = dbs.admin.model('Team');

/**
 * Globals
 */
function clearDatabase() {
	return q.all([
		Tag.remove(),
		Team.remove()
	]);
}

let tag1;

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
	tag1: {
		name: 'Tag 1',
		description: 'Description 3'
	}
};

/**
 * Unit tests
 */
describe('Tag Model:', function() {
	let team = {};

	before(function(done) {
		return clearDatabase().then(function() {
			new Team(spec.team1).save().then(function(t) {
				team = t;

				spec.tag1.owner = team;

				tag1 = new Tag(spec.tag1);
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
		it('should begin with no tags', function(done) {
			Tag.find({}).exec().then(function(tags) {
				tags.should.have.length(0);
				done();
			}, done);
		});

		it('should be able to save without problems', function(done) {
			tag1.save(done);
		});


		it('should fail when trying to save without a name', function(done) {
			tag1.name = '';
			tag1.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should fail when trying to save with an invalid owner', function(done) {
			tag1.owner = 'badowner';
			tag1.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});
});
