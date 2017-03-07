'use strict';

const _ = require('lodash'),
	path = require('path'),
	should = require('should'),
	uuid = require('node-uuid'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,

	userSpecUtil = require('../../admin/models/user-util.server.model.spec'),
	resourcesService = require('./resources.server.service')(),

	Resource = dbs.admin.model('Resource'),
	Owner = dbs.admin.model('Owner');

const clearDB = () => {
	return Promise.all([
		Resource.remove(),
		userSpecUtil.clearUsers()
	]);
};

describe('Resource Service', () => {

	let user1, user2;

	before(() => {
		return Promise.all([
			userSpecUtil.create('test01').then((result) => { user1 = result; }),
			userSpecUtil.create('test02').then((result) => { user2 = result; })
		]);
	});

	after(() => {
		return clearDB();
	});

	const verifyCount = (expectedCount) => {
		return Resource.count().then((count) => {
			should(count).eql(expectedCount);
		});
	};

	it('should start with no resources', () => {
		return verifyCount(0);
	});

	it('should add and count 3 resources for each user', () => {
		return Promise.all(_.map([user1, user2], (user) => {

			const owner = new Owner({
				type: 'user',
				_id: user._id
			});

			return Promise.all(_.times(3, () => {
				const resource = new Resource({
					title: uuid.v4(),
					owner: owner
				});

				return resource.save();
			}));

		})).then(() => {
			return verifyCount(6);
		});
	});

	it('#searchResources should find 3 resources for user1', () => {
		return resourcesService.searchResources({}, {}, user1)
			.then((results) => {
				should.exist(results);
				should(results.totalSize).eql(3);
				should(results.pageNumber).eql(0);
				should(results.totalPages).eql(1);
				should(results.elements).be.a.Array();
				should(results.elements).have.length(3);
				_.forEach(results.elements, (resource) => {
					should(resource.owner._id).eql(user1._id);
				});
			});
	});

	it('#filterResourcesByAccess should filter down to the 3 resources for non-admin user1', () => {
		return Resource.find().exec().then((allResources) => {
			const mapping = {
				allIds: _.map(allResources, (r) => { return r._id; }),
				user1Ids: _.filter(allResources, (r) => {
					return r.owner._id.toString() === user1._id.toString();
				}).map((r) => { return r._id; })
			};

			should(mapping.allIds).have.length(6);
			should(mapping.user1Ids).have.length(3);

			return mapping;
		}).then((resourceIdMapping) => {
			return resourcesService.filterResourcesByAccess(resourceIdMapping.allIds, user1)
				.then((ids) => {
					should(ids).be.a.Array();
					should(ids).have.length(3);
					_.forEach(ids, (id) => {
						const found = _.includes(resourceIdMapping.user1Ids, id);
						should(found).eql(true);
					});
				});
		});
	});

});
