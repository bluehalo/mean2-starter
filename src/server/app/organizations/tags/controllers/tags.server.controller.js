'use strict';

let
	path = require('path'),
	q = require('q'),
	_ = require('lodash'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	auditService = deps.auditService,
	util = deps.utilService,
	Tag = dbs.admin.model('Tag'),
	Team = dbs.admin.model('Team'),
	TeamMember = dbs.admin.model('TeamUser'),
	teams = require(path.resolve('./src/server/app/organizations/teams/controllers/teams.server.controller.js'));

/*
 * Local Functions
 */


/**
 * Copies the mutable fields from src to dest
 */
function copyTagMutableFields(dest, src) {
	dest.name = src.name;
	dest.description = src.description;
}


/*
 * CRUD Operations
 */


/**
 * Create a new tag.
 */
module.exports.create = function(req, res) {
	let teamId = req.body.owner.id || req.body.owner || null;

	// Create the new tag model
	let newTag = new Tag(req.body);

	// Write the auto-generated metadata
	newTag.created = Date.now();
	newTag.updated = Date.now();

	// Audit the tag creation
	auditService.audit('tag created', 'tag', 'create', TeamMember.auditCopy(req.user), Tag.auditCopy(newTag))
		.then(function() {
			return Team.findOne({ _id: teamId }).exec();
		})
		.then(function(team) {
			if (null != team) {
				newTag.owner = team;
				return q(newTag);
			}
			return q.reject({ status: 400, type: 'bad-request', message: 'Invalid team id.' });
		})
		.then(function(tag) {
			return tag.save();
		})
		.then(function(result) {
			res.status(200).json(result);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Read the team
 */
module.exports.read = function(req, res) {
	res.status(200).json(req.tag);
};


/**
 * Update the tag metadata
 */
module.exports.update = function(req, res) {
	// Retrieve the tag from persistence
	let tag = req.tag;

	// Make a copy of the original tag for a "before" snapshot
	let originalTag = Tag.auditCopy(tag);

	// Update the updated date
	tag.updated = Date.now();

	// Copy in the fields that can be changed by the user
	copyTagMutableFields(tag, req.body);

	// Audit the save action
	auditService.audit('tag updated', 'tag', 'update', TeamMember.auditCopy(req.user), { before: originalTag, after: Tag.auditCopy(tag) })
		.then(function() {
			return tag.save();
		})
		.then(function(result) {
			res.status(200).json(result);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Delete the team
 */
module.exports.delete = function(req, res) {
	let tag = req.tag;

	// Audit the deletion attempt
	auditService.audit('tag deleted', 'tag', 'delete', TeamMember.auditCopy(req.user), Tag.auditCopy(req.tag))
		.then(function() {
			return tag.remove();
		})
		.then(function() {
			res.status(200).json(tag);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Search the tags, includes paging and sorting
 */
module.exports.search = function(req, res) {
	let search = req.body.s || null;
	let query = req.body.q || {};
	query = util.toMongoose(query);

	// Get the limit provided by the user, if there is one.
	// Limit has to be at least 1 and no more than 100.
	let limit = Math.floor(req.query.size);
	if (null == limit || isNaN(limit)) {
		limit = 20;
	}
	limit = Math.max(1, Math.min(100, limit));

	// default sorting by ID
	let sortArr = [{ property: '_id', direction: 'DESC' }];
	if(null != req.query.sort && null != req.query.dir) {
		sortArr = [{ property:  req.query.sort, direction: req.query.dir }];
	}

	// Page needs to be positive and has no upper bound
	let page = req.query.page;
	if (null == page){
		page = 0;
	}
	page = Math.max(0, page);

	let offset = page * limit;

	// If user is not an admin, constrain the results tags owned by the user's teams
	if(null == req.user.roles || !req.user.roles.admin) {
		let userObj = req.user.toObject();
		let teams =  [];

		if (null != userObj.teams && _.isArray(userObj.teams)) {
			teams = userObj.teams.map((t) => t._id.toString() );
		}

		// If the query already has a filter by team, take the intersection
		if (null != query.owner && null != query.owner.$in) {
			teams = teams.filter((t) => query.owner.$in.indexOf(t) > -1);
		}

		// If no remaining teams, return no results
		if (teams.length === 0) {
			res.status(200).json({
				totalSize: 0,
				pageNumber: 0,
				pageSize: limit,
				totalPages: 0,
				elements: []
			});
			return;
		}

		query.owner = {
			$in: teams
		};
	}

	Tag.search(query, search, limit, offset, sortArr)
		.then(function(result) {
			// Success
			return {
				totalSize: result.count,
				pageNumber: page,
				pageSize: limit,
				totalPages: Math.ceil(result.count / limit),
				elements: result.results
			};
		})
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
					return teams.meetsRoleRequirement(user, team, role);
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

