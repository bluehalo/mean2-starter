'use strict';

let mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),
	_ = require('lodash'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	logger = deps.logger,
	auditService = deps.auditService,
	util = deps.utilService,
	Project = dbs.admin.model('Project'),
	Team = dbs.admin.model('Team'),
	TeamMember = dbs.admin.model('TeamUser'),
	teams = require(path.resolve('./src/server/teams/controllers/teams.server.controller.js'));

/*
 * Local Functions
 */


/**
 * Copies the mutable fields from src to dest
 */
function copyProjectMutableFields(dest, src) {
	dest.name = src.name;
	dest.description = src.description;
}


/*
 * CRUD Operations
 */


/**
 * Create a new project.
 */
module.exports.create = function(req, res) {
	let teamId = req.body.owner.id || req.body.owner || null;

	// Create the new project model
	let newProject = new Project(req.body);

	// Write the auto-generated metadata
	newProject.created = Date.now();
	newProject.updated = Date.now();

	// Audit the project creation
	auditService.audit('project created', 'project', 'create', TeamMember.auditCopy(req.user), Project.auditCopy(project))
		.then(function() {
			return Team.findOne({ _id: teamId }).exec();
		})
		.then(function(team) {
			if (null != team) {
				newProject.owner = team;
				return q(newProject);
			}
			return q.reject({ status: 400, type: 'bad-request', message: 'Invalid team id.' });
		})
		.then(function(project) {
			return project.save();
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
	res.status(200).json(req.project);
};


/**
 * Update the project metadata
 */
module.exports.update = function(req, res) {
	// Retrieve the project from persistence
	let project = req.project;

	// Make a copy of the original project for a "before" snapshot
	let originalProject = Project.auditCopy(project);

	// Update the updated date
	project.updated = Date.now();

	// Copy in the fields that can be changed by the user
	copyProjectMutableFields(project, req.body);

	// Audit the save action
	auditService.audit('project updated', 'project', 'update', TeamMember.auditCopy(req.user), { before: originalProject, after: Project.auditCopy(project) })
		.then(function() {
			return project.save();
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
	let project = req.project;

	// Audit the deletion attempt
	auditService.audit('project deleted', 'project', 'delete', TeamMember.auditCopy(req.user), Project.auditCopy(req.project))
		.then(function() {
			return project.remove();
		})
		.then(function() {
			res.status(200).json(project);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Search the projects, includes paging and sorting
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

	// If user is not an admin, constrain the results projects owned by the user's teams
	if(null == req.user.roles || !req.user.roles.admin) {
		let userObj = req.user.toObject();
		let teams =  [];

		if (null != userObj.teams && _.isArray(userObj.teams)) {
			teams = userObj.teams.map(t => t._id.toString() );
		}

		// If the query already has a filter by team, take the intersection
		if (null != query.owner && null != query.owner.$in) {
			teams = teams.filter(t => query.owner.$in.indexOf(team) > -1);
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

	Project.search(query, search, limit, offset, sortArr)
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
 * Project middleware
 */
module.exports.projectById = function(req, res, next, id) {
	Project.findOne({ _id: id })
		.exec()
		.then(function(project) {
			if (null == project) {
				next(new Error('Could not find project: ' + id));
			}
			else {
				req.project = project;
				next();
			}
		}, next);
};


/**
 * Does the user have the referenced role in the team that owns the project
 */
module.exports.requiresRole = function(role) {
	return function(req) {

		// Verify that the user and project are on the request
		let user = req.user.toObject();
		if(null == user) {
			return q.reject({ status: 400, type: 'bad-request', message: 'No user for request' });
		}
		let project = req.project;

		if (null == project) {
			// Try the request body
			project = req.body;
		}

		if(null == project || null == project.owner) {
			return q.reject({ status: 400, type: 'bad-request', message: 'No project for request' });
		}

		// Get the team that owns the project
		return Team.findOne({ _id: project.owner })
			.exec()
			.then(function(team) {
				if (null != team) {
					return teams.meetsRoleRequirement(user, team, role);
				}

				return q.reject({ status: 404, type: 'not-found', message: 'No owner found for project.' });
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

