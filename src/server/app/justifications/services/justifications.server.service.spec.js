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

	User = dbs.admin.model('User'),
	Justification = dbs.admin.model('Justification'),

	justificationsService = require(path.resolve('./src/server/app/justifications/services/justifications.server.service.js'))();

/**
 * Globals
 */
function clearDatabase() {
	return q.all([
		User.remove().exec(),
		Justification.remove().exec()
	]);
}

function clearJustifications() {
	return Justification.remove().exec();
}

function userSpec(key) {
	return {
		name: key + ' Name',
		organization: key + ' Organization',
		email: key + '@mail.com',
		username: key + '_username',
		password: 'password',
		provider: 'local'
	};
}

function justificationSpec(key, user) {
	return {
		text: key,
		owner: user._id
	};
}

function sleep(time) {
	return new Promise(function(resolve) {
		setTimeout(resolve, time);
	});
}

/**
 * Unit tests
 */
describe('Justification Service:', function() {
	let users = [];

	before(function(done) {
		return clearDatabase().then(function() {
			// Create two users
			let userDefers = [];
			for (let i = 0; i < 2; ++i) {
				userDefers[i] = (new User(userSpec(i.toString()))).save();
			}

			return q.all(userDefers);
		}).then(function(result) {
			users = result;
			return q();
		}).then(function() {
			done();
		}, done).done();
	});

	after(function(done) {
		return clearDatabase().then(function() {
			done();
		}, done).done();
	});

	it('Create new justification, with and without duplicates', function() {
		let justification1 = justificationSpec('Justification 1', users[0]);

		return justificationsService.createJustification(justification1).then((result) => {
			// create new justification should return null
			should(result).be.null();
			return justificationsService.createJustification(justification1);
		}).then((result) => {
			// update new justification should return the updated justification
			should(result).not.be.null();
		});
	});

	it('Touch new justification creates it', function() {
		let justification1 = new Justification(justificationSpec('Justification 2', users[0]));

		return clearJustifications().then(() => {
			return justificationsService.touchJustification(justification1);
		}).then((result) => {
			return justificationsService.searchJustifications(null, {}, {});
		}).then((result) => {
			should(result).not.be.null();
			(result.elements).should.have.length(1);
		});
	});

	it('Touching existing justification updates it', function() {
		let justification1 = justificationSpec('Justification 3', users[0]);

		return clearJustifications().then(() => {
			return justificationsService.createJustification(justification1);
		}).then((result) => {
			return justificationsService.searchJustifications(null, {}, {});
		}).then((result) => {
			should(result).not.be.null();
			(result.elements).should.have.length(1);

			return sleep(1000).then(() => {
				return justificationsService.touchJustification(result.elements[0]);
			}).then((result) => {
				should(result.updated).not.equal(result.created);
			});
		});
	});

	it('Creating justifications with same text but different owners creates two justifications', function() {
		let justification1 = justificationSpec('Justification 4', users[0]);
		let justification2 = justificationSpec('Justification 4', users[1]);

		return clearJustifications().then(() => {
			return justificationsService.createJustification(justification1);
		}).then(() => {
			return justificationsService.createJustification(justification2);
		}).then(() => {
			return justificationsService.searchJustifications(null, {}, {});
		}).then((result) => {
			should(result).not.be.null();
			(result.elements).should.have.length(2);
		});
	});
});