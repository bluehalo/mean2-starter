'use strict';

/**
 * Module dependencies.
 */
var
	path = require('path'),
	q = require('q'),
	should = require('should'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,

	Audit = dbs.admin.model('Audit'),
	Group = dbs.admin.model('Group'),
	User = dbs.admin.model('User'),
	groups = require(path.resolve('./src/server/app/groups/controllers/groups.server.controller.js'));

/**
 * Globals
 */
function clearDatabase() {
	return q.all([
		Audit.remove(),
		Group.remove(),
		User.remove()
	]);
}

var group1, group2, group3, group4;

var spec = {
	user1: {
		name: 'User 1',
		email: 'user1@mail.com',
		username: 'user1',
		password: 'password',
		provider: 'local'
	},
	group1: {
		title: 'Title',
		description: 'Description'
	},
	group2: {
		title: 'Title 2',
		description: 'Description 2'
	},
	group3: {
		title: 'Title 3',
		description: 'Description 3'
	},
	group4: {
		title: 'Title 4',
		description: 'Description 4'
	}
};

/**
 * Unit tests
 */
describe('Group Model:', function() {
	before(function() {
		return clearDatabase().then(function() {
			group1 = new Group(spec.group1);
			group2 = new Group(spec.group2);
			group3 = new Group(spec.group3);
			group4 = new Group(spec.group4);
		});
	});

	after(function() {
		return clearDatabase();
	});

	describe('Method Save', function() {
		it('should begin with no groups', function() {
			return Group.find({}).exec().then(function(groups) {
				should(groups).be.an.Array();
				should(groups).have.length(0);
			});
		});

		it('should be able to save without problems', function() {
			return group1.save();
		});

		it('should fail when trying to save without a title', function() {
			group1.title = '';
			return group1.save().then(function() {
				should.fail('should generate an error when saving without a title');
			}, function(err) {
				should.exist(err);
			});
		});

	});

	describe('User group permissions', function() {
		var user1 = new User(spec.user1);

		it('should begin with no users', function() {
			return User.find({}).exec().then(function(users) {
				should(users).be.an.Array();
				should(users).have.length(0);
			});
		});

		it('should create groups without problems', function() {
			return q.all([
				group2.save(),
				group3.save(),
				group4.save()
			]).then(function(results) {
				should(results).be.an.Array();
				should(results).have.length(3);
			});
		});

		it ('should associate group editing with user 1', function() {
			user1.groups = [];
			user1.groups.push({ _id: group1.id });
			user1.groups.push({ _id: group2.id, roles: { editor: true } });
			user1.groups.push({ _id: group3.id, roles: { editor: true, admin: true } });

			var groupIds = groups.getGroupIds(user1);
			var editorGroupIds = groups.getEditGroupIds(user1);
			var adminGroupIds = groups.getAdminGroupIds(user1);

			should(groupIds).be.an.Array();
			should(groupIds).have.length(3);
			should(groupIds).containDeep([ group1.id, group2.id, group3.id ]);

			should(editorGroupIds).be.an.Array();
			should(editorGroupIds).have.length(2);
			should(editorGroupIds).containDeep([ group2.id, group3.id ]);

			should(adminGroupIds).be.an.Array();
			should(adminGroupIds).have.length(1);
			should(adminGroupIds).containDeep([ group3.id ]);
		});

		it ('should filter groupIds', function() {
			var groupIds1 = groups.filterGroupIds(user1, [ group1.id ]);
			should(groupIds1).be.an.Array();
			should(groupIds1).have.length(1);
			should(groupIds1).containDeep([ group1.id ]);

			var groupIds2 = groups.filterGroupIds(user1, [ group1.id, group2.id, group4.id ]);
			should(groupIds2).be.an.Array();
			should(groupIds2).have.length(2);
			should(groupIds2).containDeep([ group1.id,  group2.id ]);

			// Try it with a group the user has no access to.
			var groupIds3 = groups.filterGroupIds(user1, [ group4.id ]);
			should(groupIds3).be.an.Array();
			should(groupIds3).have.length(0);

			// Try it without any explicit group filters.  We should get all the user's groups.
			var groupIds4 = groups.filterGroupIds(user1);
			should(groupIds4).be.an.Array();
			should(groupIds4).have.length(3);
			should(groupIds4).containDeep([ group1.id, group2.id, group3.id ]);
		});
	});
});
