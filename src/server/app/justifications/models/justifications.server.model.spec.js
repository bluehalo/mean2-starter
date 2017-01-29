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

	Justification = dbs.admin.model('Justification'),
	User = dbs.admin.model('User');

/**
 * Globals
 */
function clearDatabase() {
	return q.all([
		Justification.remove(),
		User.remove()
     ]);
}

let justification1;

let spec = {
	user1: {
		name: 'User 1',
		organization: 'Organization 1',
		email: 'user1@mail.com',
		username: 'user1',
		password: 'password',
		provider: 'local'
	},
	justification1: {
		text: 'Justification 1'
	}
};

/**
 * Unit tests
 */
describe('Justification Model:', function() {
	let user = {};

	before(function() {
		return clearDatabase()
			.then(
				() => {
					return new User(spec.user1).save().then((u) => {
						user = u;
						spec.justification1.owner = user;

						justification1 = new Justification(spec.justification1);
					});
				});
	});

	after(function() {
		return clearDatabase();
	});

	describe('Method Save', function() {
		it('should begin with no justifications', function() {
			return Justification.find({}).exec()
				.then(
					(justifications) => {
						should.exist(justifications);
						justifications.should.have.length(0);
					},
					(err) => {
						should.not.exist(err);
					});
		});

		it('should be able to save without problems', function() {
			return justification1.save().should.be.fulfilled();
		});


		it('should fail when trying to save without any text (or an empty text)', function(done) {
			justification1.text = '';

			justification1.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});
});
