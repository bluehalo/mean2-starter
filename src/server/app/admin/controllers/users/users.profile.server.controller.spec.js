'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),
	should = require('should'),

	User = mongoose.model('User'),

	userProfileController = require(path.resolve('./src/server/app/admin/controllers/users/users.profile.server.controller.js'));

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
		password: 'password',
		provider: 'local',
		organization: key + ' Organization'
	};
}

/**
 * Unit tests
 */
describe('User Profile Controller:', function() {
	// specs for tests
	var spec = { user: {} };

	// Basic Users
	spec.user.user1 = userSpec('basic1');
	spec.user.user2 = userSpec('basic2');
	spec.user.user3 = userSpec('basic3');

	var user = {};

	before(function() {
		return clearDatabase().then(function() {
			var defers = [];

			defers = defers.concat(_.keys(spec.user).map(function(k) {
				return (new User(spec.user[k])).save().then(function(e) {
					user[k] = e;
				});
			}));

			return q.all(defers);
		});
	});

	after(function() {
		return clearDatabase();
	});


	describe('adminGetAll', function() {

		it('should return all usernames', function(done) {
			var req = {
				body: { field: 'username', query: {}},
				query: {}
			};
			var res = {
				status : function(status) {
					should(status).equal(200);
					return {
						json: function(results) {
							should(results).be.an.Array();
							should(results).have.length(3);
							should(results).containDeep([ spec.user.user1.username, spec.user.user2.username, spec.user.user3.username ]);

							done();
						}
					};
				}
			};

			userProfileController.adminGetAll(req, res);
		});

		it('getting one username should return the 1 expected', function(done) {
			var req = {
				body: { field: 'username', query: { username: spec.user.user1.username }},
				query: {}
			};
			var res = {
				status : function(status) {
					should(status).equal(200);
					return {
						json: function(results) {
							should(results).be.an.Array();
							should(results).have.length(1);
							should(results).containDeep([ spec.user.user1.username ]);

							done();
						}
					};
				}
			};

			userProfileController.adminGetAll(req, res);
		});

		it('getting one _id should return the 1 expected', function(done) {
			var req = {
				body: { field: 'username', query: { _id: { $obj: user.user1._id.toString() } }},
				query: {}
			};
			var res = {
				status : function(status) {
					should(status).equal(200);
					return {
						json: function(results) {
							should(results).be.an.Array();
							should(results).have.length(1);
							should(results).containDeep([ spec.user.user1.username ]);

							done();
						}
					};
				}
			};

			userProfileController.adminGetAll(req, res);
		});

	});

	describe('canEditProfile', function() {

		it('local auth and undef bypass should be able to edit', function() {
			var user = { };
			var result = userProfileController.canEditProfile('local', user);
			result.should.equal(true);
		});

		it('local auth and no bypass should be able to edit', function() {
			var user = { bypassAccessCheck: false };
			var result = userProfileController.canEditProfile('local', user);
			result.should.equal(true);
		});

		it('local auth and bypass should be able to edit', function() {
			var user = { bypassAccessCheck: true };
			var result = userProfileController.canEditProfile('local', user);
			result.should.equal(true);
		});

		it('proxy-pki auth and undef bypass should not be able to edit', function() {
			var user = { };
			var result = userProfileController.canEditProfile('proxy-pki', user);
			result.should.equal(false);
		});

		it('proxy-pki auth and no bypass should not be able to edit', function() {
			var user = { bypassAccessCheck: false };
			var result = userProfileController.canEditProfile('proxy-pki', user);
			result.should.equal(false);
		});

		it('proxy-pki auth and bypass should be able to edit', function() {
			var user = { bypassAccessCheck: true };
			var result = userProfileController.canEditProfile('proxy-pki', user);
			result.should.equal(true);
		});

	});

});
