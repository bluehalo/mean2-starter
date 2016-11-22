'use strict';

let
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	util = deps.utilService,
	Tag = dbs.admin.model('Tag'),
	Team = dbs.admin.model('Team'),
	tagsService = require(path.resolve('./src/server/app/teams/services/tags.server.service.js'))(),
	teamsService = require(path.resolve('./src/server/app/teams/services/teams.server.service.js'))();


/**
 * Create a new tag.
 */
module.exports.create = function(req, res) {
	tagsService.createTag(req.body, req.user)
		.then(function(result) {
			res.status(200).json(result);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Read the tag
 */
module.exports.read = function(req, res) {
	res.status(200).json(req.tag);
};


/**
 * Update the tag metadata
 */
module.exports.update = function(req, res) {
	tagsService.updateTag(req.tag, req.body, req.user)
		.then(function(result) {
			res.status(200).json(result);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Delete the tag
 */
module.exports.delete = function(req, res) {
	tagsService.deleteTag(req.tag, req.user)
		.then(function(result) {
			res.status(200).json(req.tag);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Search the tags, includes paging and sorting
 */
module.exports.search = function(req, res) {
	// Get search and query parameters
	let search = req.body.s || null;
	let query = req.body.q || {};
	query = util.toMongoose(query);

	tagsService.searchTags(search, query, req.query, req.user)
		.then(function(result) {
			res.status(200).json(result);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Tag middleware
 */
module.exports.tagById = function(req, res, next, id) {
	Tag.findOne({ _id: id })
		.exec()
		.then(function(tag) {
			if (null == tag) {
				next(new Error('Could not find tag: ' + id));
			}
			else {
				req.tag = tag;
				next();
			}
		}, next);
};


/**
 * Does the user have the referenced role in the team that owns the tag
 */
module.exports.requiresRole = function(role) {
	return function(req) {

		// Verify that the user and tag are on the request
		let user = req.user.toObject();
		if(null == user) {
			return q.reject({ status: 400, type: 'bad-request', message: 'No user for request' });
		}
		let tag = req.tag;

		if (null == tag) {
			// Try the request body
			tag = req.body;
		}

		if(null == tag || null == tag.owner) {
			return q.reject({ status: 400, type: 'bad-request', message: 'No tag for request' });
		}

		// Get the team that owns the tag
		return Team.findOne({ _id: tag.owner })
			.exec()
			.then(function(team) {
				if (null != team) {
					return teamsService.meetsRoleRequirement(user, team, role);
				}

				return q.reject({ status: 404, type: 'not-found', message: 'No owner found for tag.' });
			});
	};
};

exports.requiresAdmin = function(req) {
	return module.exports.requiresRole('admin')(req);
};

exports.requiresEditor = function(req) {
	return module.exports.requiresRole('editor')(req);
};

exports.requiresMember = function(req) {
	return module.exports.requiresRole('member')(req);
};

