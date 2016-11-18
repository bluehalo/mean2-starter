'use strict';

/**
 * Module dependencies.
 */
let _ = require('lodash'),
	path = require('path'),
	q = require('q'),
	should = require('should'),

	deps = require(path.resolve('./config/dependencies.js')),
	dbs = deps.dbs,

	User = dbs.admin.model('User'),
	Team = dbs.admin.model('Team'),
	TeamMember = dbs.admin.model('TeamUser'),
	TeamRole = dbs.admin.model('TeamRole'),

	teamController = require(path.resolve('app/teams/server/controllers/teams.server.controller.js'));


/**
 * Helpers
 */


function clearDatabase() {
	return q.all([
		Team.remove(),
		User.remove()
	]);
}

function userSpec(key) {
	return {
		name: key + ' Name',
		email: key + '@mail.com',
		username: key + '_username',
		organization: key + ' Organization'
	};
}

function proxyPkiUserSpec(key) {
	let spec = userSpec(key);
	spec.provider = 'proxy-pki';
	spec.providerData = {
		dn: key,
		dnLower: key.toLowerCase()
	};
	return spec;
}

function teamSpec(key) {
	return {
		name: key,
		description: key + 'Team Description '
	};
}

/**
 * Unit tests
 */
describe('Team Controller:', function() {
	// Specs for tests
	let spec = { team: {}, user: {} };

	// Teams for tests
	spec.team.teamWithExternalTeam = teamSpec('external');
	spec.team.teamWithExternalTeam.requiresExternalTeams = ['external-group'];

	spec.team.teamWithNoExternalTeam = teamSpec('no-external');
	spec.team.teamWithNoExternalTeam.requiresExternalTeams = [];


	// User implicit added to team by having an external group
	spec.user.implicit = proxyPkiUserSpec('implicit');
	spec.user.implicit.externalGroups = ['external-group'];

	// User explicitly added to a group.  Group is added in before() block below
	spec.user.explicit = proxyPkiUserSpec('explicit');

	let user = {};
	let team = {};

	before(function(done) {
		clearDatabase().then(function() {
			let teamDefers = [];

			// Create the teams
			_.keys(spec.team).forEach(function(k) {
				teamDefers.push((new Team(spec.team[k])).save().then(function(e) {
					team[k] = e;
				}));
			});

			return q.all(teamDefers).then(function(result) {

				let userDefers = [];
				_.keys(spec.user).forEach(function(k) {
					userDefers.push((new User(spec.user[k])).save().then(function(e) {
						user[k] = e;

						// Do this here because of issues using extended mongo schema in tests
						if (k === 'explicit') {
							TeamMember.update(
								{ _id: e._id },
								{ $addToSet: { teams: new TeamRole({ _id: team.teamWithNoExternalTeam._id, role: 'member' }) } }
								)
								.exec();
						}
					}));
				});

				return q.all(userDefers);
			});

		}).then(function() {
			done();
		}, done).done();

	});

	after(function(done) {
		clearDatabase().then(function() {
			done();
		}, done).done();
	});

	// Test implicit team membership
	it('Search team membership; user implicitly added to a team via externalGroups', function(done) {
		let req = {
			query: { dir: 'ASC', page: '0', size: '5', sort: 'name' },
			body: {}
		};
		let res = {};

		Team.findOne({ name: 'external' })
			.exec()
			.then(function(team) {
				req.team = team;
				res.status = function(status) {
					should(status).equal(200);

					return {
						json: function(results) {
							should.exist(results);
							(results.elements).should.have.length(1);
							should(results.elements[0].name).equal('implicit Name');

							done();
						}
					};
				};

				teamController.searchMembers(req, res, function() {});
			}, done).done();

	});

	// Test explicit team membership
	it('Search team membership; user explicitly added to a team through the user.teams property', function(done) {
		let req = {
			query: { dir: 'ASC', page: '0', size: '5', sort: 'name' },
			body: {}
		};
		let res = {};

		Team.findOne({ name: 'no-external' })
			.exec()
			.then(function(team) {
				req.team = team;
				res.status = function(status) {
					should(status).equal(200);

					return {
						json: function(results) {
							should.exist(results);
							should(results.elements).be.an.Array();
							should(results.elements).have.length(1);
							should(results.elements[0].name).equal('explicit Name');

							done();
						}
					};
				};

				teamController.searchMembers(req, res, function() {});
			}, done);
	});

	it('meetsRequiredExternalTeams', function(done) {
		let user = { bypassAccessCheck: true };
		let team = {};

		let match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(true);

		user = { bypassAccessCheck: false };
		team = {};

		match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(false);

		user = { bypassAccessCheck: false };
		team = { requiresExternalTeams: ['one']};

		match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(false);

		user = { bypassAccessCheck: false, externalGroups: ['two'] };
		team = { requiresExternalTeams: ['one']};

		match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(false);

		user = { bypassAccessCheck: false, externalGroups: ['one'] };
		team = { requiresExternalTeams: ['one']};

		match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(true);

		user = { bypassAccessCheck: false, externalGroups: ['two'] };
		team = { requiresExternalTeams: ['one', 'two']};

		match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(true);

		user = { bypassAccessCheck: false, externalGroups: ['two', 'four'] };
		team = { requiresExternalTeams: ['one', 'two']};

		match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(true);

		user = { bypassAccessCheck: false, externalGroups: ['two', 'four'] };
		team = { requiresExternalTeams: ['four', 'one', 'two']};

		match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(true);

		user = { bypassAccessCheck: false, externalGroups: ['two'] };
		team = { requiresExternalTeams: []};

		match = teamController.meetsRequiredExternalTeams(user,team);

		match.should.equal(false);

		done();
	});
});
