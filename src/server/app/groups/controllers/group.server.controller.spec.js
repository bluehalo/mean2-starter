'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	q = require('q'),
	should = require('should'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,

	User = dbs.admin.model('User'),
	Group = dbs.admin.model('Group'),

	groupController = require(path.resolve('./src/server/app/groups/controllers/groups.server.controller.js'));


/**
 * Helpers
 */

function clearDatabase() {
	return q.all([
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
	var spec = userSpec(key);
	spec.provider = 'proxy-pki';
	spec.providerData = {
		dn: key,
		dnLower: key.toLowerCase()
	};
	return spec;
}

function groupSpec(key) {
	return {
		title: key,
		description: key + 'Group Description '
	};
}

/**
 * Unit tests
 */
describe('Group Controller:', function() {
	// Specs for tests
	var spec = { group: {}, user: {} };

	// Groups for tests
	spec.group.groupWithExternalGroup = groupSpec('external');
	spec.group.groupWithExternalGroup.requiresExternalGroups = ['external-group'];

	spec.group.groupWithNoExternalGroup = groupSpec('no-external');
	spec.group.groupWithNoExternalGroup.requiresExternalGroups = [];


	// User implicit added to group by having an external group
	spec.user.implicit = proxyPkiUserSpec('implicit');
	spec.user.implicit.externalGroups = ['external-group'];

	// User explicitly added to a group.  Group is added in before() block below
	spec.user.explicit = proxyPkiUserSpec('explicit');

	var user = {};
	var group = {};

	before(function() {
		return clearDatabase().then(function() {
			var groupDefers = [];

			// Create the groups
			groupDefers = groupDefers.concat(_.keys(spec.group).map(function(k) {
				return (new Group(spec.group[k])).save().then(function(e) {
					group[k] = e;
				});
			}));

			return q.all(groupDefers).then(function() {
				// Set a group on the explicit user
				spec.user.explicit.groups = [
					{
						roles : {
							follower : false,
							admin : false,
							editor : false
						},
						// Add the actual group to the user
						_id : group.groupWithNoExternalGroup._id
					}
				];

				var userDefers = [];
				userDefers = userDefers.concat(_.keys(spec.user).map(function(k) {
					return (new User(spec.user[k])).save().then(function(e) {
						user[k] = e;
					});
				}));

				return q.all(userDefers);
			});
		});
	});

	after(function() {
		return clearDatabase();
	});

	// Test implicit group membership
	it('Search group membership; user implicitly added to a group via externalGroups', function(done) {
		var req = {
			query: { dir: 'ASC', page: '0', size: '5', sort: 'name' },
			body: {}
		};
		var res = {};

		Group.findOne({ title: 'external' })
			.exec()
			.then(function(group) {
				req.group = group;
				res.status = function(status) {
					should(status).equal(200);

					return {
						json: function(results) {
							should.exist(results);
							should(results.elements).be.an.Array();
							should(results.elements).have.length(1);
							should(results.elements[0].name).equal('implicit Name');

							done();
						}
					};
				};

				groupController.searchMembers(req, res, function() {});
			}, done);

	});

	// Test explicit group membership
	it('Search group membership; user explicitly added to a group through the user.groups property', function(done) {
		var req = {
			query: { dir: 'ASC', page: '0', size: '5', sort: 'name' },
			body: {}
		};
		var res = {};

		Group.findOne({ title: 'no-external' })
			.exec()
			.then(function(group) {
				req.group = group;
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

				groupController.searchMembers(req, res, function() {});
			}, done);
	});
});
