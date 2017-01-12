'use strict';

/**
 * Module dependencies.
 */
let path = require('path'),
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

	before(function() {
		return clearDatabase()
			.then(
				() => {
					return new Team(spec.team1).save().then((t) => {
						team = t;
						spec.tag1.owner = team;

						tag1 = new Tag(spec.tag1);
					});
				});
	});

	after(function() {
		return clearDatabase();
	});

	describe('Method Save', function() {
		it('should begin with no tags', function() {
			return Tag.find({}).exec()
				.then(
					(tags) => {
						should.exist(tags);
						tags.should.have.length(0);
					},
					(err) => {
						should.not.exist(err);
					});
		});

		it('should be able to save without problems', function() {
			return tag1.save().should.be.fulfilled();
		});


		it('should fail when trying to save without a name', function() {
			tag1.name = '';
			return tag1.save().should.be.rejected();
		});

		it('should fail when trying to save with an invalid owner', function() {
			tag1.owner = 'badowner';
			return tag1.save().should.be.rejected();
		});
	});
});
