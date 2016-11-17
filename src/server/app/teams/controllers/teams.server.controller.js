'use strict';

let mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),
	_ = require('lodash'),

	deps = require(path.resolve('./config/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	auditService = deps.auditService,
	util = deps.utilService,
	Project = dbs.admin.model('Project'),
	TeamMember = dbs.admin.model('TeamUser'),
	Team = dbs.admin.model('Team'),
	TeamRole = dbs.admin.model('TeamRole');

/*
 * Local Functions
 */

let teamRolesMap = {
	member: { priority: 1 },
	editor: { priority: 5 },
	admin: { priority: 7 }
};

let teamRoles = _.keys(teamRolesMap);

/**
 * Copies the mutable fields from src to dest
 */
function copyTeamMutableFields(dest, src) {
	dest.name = src.name;
	dest.description = src.description;
	dest.requiresExternalTeams = src.requiresExternalTeams;
}


/**
 * Checks if user role meets or exceeds the requestedRole according to
 * pre-defined a pre-defined role hierarchy
 * @returns {boolean}
 */
function meetsOrExceedsRole(userRole, requestedRole) {
	if (null != userRole && teamRolesMap.hasOwnProperty(userRole) && null != requestedRole && teamRolesMap.hasOwnProperty(requestedRole)) {
		return (teamRolesMap[userRole].priority >= teamRolesMap[requestedRole].priority);
	}
	return false;
}


/**
 * Checks if the user meets the required external teams for this team
 * If the user is bypassed, they automatically meet the required external teams
 * @returns {boolean}
 */
function meetsRequiredExternalTeams(user, team) {
	if(true === user.bypassAccessCheck) {
		return true;
	} else {
		// Check the required external teams against the user's externalGroups
		return _.intersection(team.requiresExternalTeams, user.externalGroups).length > 0;
	}
}

module.exports.meetsRequiredExternalTeams = meetsRequiredExternalTeams;


/**
 * Gets the role of this user in this team.
 * @param team The team object of interest
 * @param user The user object of interest
 * @returns Returns the role of the user in the team or null if user doesn't belong to team.
 */
function getTeamRole(user, team) {
	let ndx = _.findIndex(user.teams, t => t._id.equals(team._id));

	if (-1 !== ndx) {
		return user.teams[ndx].role;
	}

	return null;
}


/**
 * Gets the team role for the specified user
 * and also applies the business logic of if they are implicitly a member
 * of the team or if they are an inactive explicit member of a team
 * @returns Returns a role, or null if the user is not a member of the team
 */
function getActiveTeamRole(user, team) {
	// No matter what, we need to get these
	let teamRole = getTeamRole(user, team);

	let proxyPkiMode = config.auth.strategy === 'proxy-pki';
	let teamHasRequirements = (_.isArray(team.requiresExternalTeams) && team.requiresExternalTeams.length > 0);

	// If we are in proxy-pki mode and the team has external requirements
	if(proxyPkiMode && teamHasRequirements) {

		// If the user is active
		if(meetsRequiredExternalTeams(user, team)) {
			// Return either the team role (if defined), or the default role
			return (null != teamRole) ? teamRole : 'member';
		}
		// The user is inactive
		else {
			// Return null since no matter what, they are not a member of this team
			return null;
		}
	}
	// We are not in proxy-pki mode, or the team has no requirements
	else {
		// Return the team role
		return teamRole;
	}
}


/**
 * Checks if the member is the last admin of the team
 * @param user The user object of interest
 * @param team The team object of interest
 * @returns {Promise} Returns a promise that resolves if the user is not the last admin, and rejects otherwise
 */
function verifyNotLastAdmin(user, team) {
	// Search for all users who have the admin role set to true
	return TeamMember.find({
			_id: { $ne: user._id },
			teams: { $elemMatch: { _id: team._id, role: 'admin' } }
		})
		.exec()
		.then(function(results) {
			// Just need to make sure we find one active admin who isn't this user
			let adminFound = results.some(function(u) {
				let role = getActiveTeamRole(u, team);
				return (null != role && role === 'admin');
			});

			if(adminFound) {
				return q();
			}
			else {
				return q.reject({ status: 400, type: 'bad-request', message: 'Team must have at least one admin' });
			}
		});
}


/**
 * Helper function to add user to a team
 */
function addMemberToTeam(team, user, role, actor) {
	// Audit the member add request
	return auditService.audit(`team ${role} added`, 'team-role', 'user add',
			TeamMember.auditCopy(actor), Team.auditCopyTeamMember(team, user, role))
		.then(function() {
			return TeamMember.update({ _id: user._id }, { $addToSet: { teams: new TeamRole({ _id: team._id, role: role }) } }).exec();
		});
}


/**
 * Helper function to update user role in team
 */
function updateMemberRoleInTeam(team, user, role, actor) {
	// Audit the member update request
	return auditService.audit(`team role changed to ${role}`, 'team-role', 'user add',
			TeamMember.auditCopy(actor), Team.auditCopyTeamMember(team, user, role))
		.then(function() {
			return TeamMember.findOneAndUpdate({ _id: user._id, 'teams._id': team._id }, { $set: { 'teams.$.role': role } }).exec();
		});
}


/**
 * Helper function to remove member from team
 */
function removeMemberFromTeam(team, user, actor) {
	// Verify the user is not the last admin in the team
	return verifyNotLastAdmin(user, team)
		.then(function () {
			// Audit the user remove
			return auditService.audit('team member removed', 'team-role', 'user remove',
				TeamMember.auditCopy(actor), Team.auditCopyTeamMember(team, user, ''))
				.then(function () {
					// Apply the update
					return TeamMember.update({_id: user._id}, {$pull: {teams: {_id: team._id}}}).exec()
				});
		});
}


/**
 * Validates that the roles are one of the accepted values
 */
function validateTeamRole(role) {
	if (-1 !== teamRoles.indexOf(role)) {
		return q();
	}
	else {
		return q.reject({ status: 400, type: 'bad-argument', message: 'Team role does not exist' });
	}
}


/*
 * CRUD Operations
 */


/**
 * Create a new team. The team creator is automatically added as an admin
 */
module.exports.create = function(req, res) {

	// Create the new team model
	let newTeam = new Team(req.body);

	// Write the auto-generated metadata
	newTeam.creator = req.user;
	newTeam.created = Date.now();
	newTeam.updated = Date.now();
	newTeam.creatorName = req.user.name;

	// Audit the creation event
	auditService.audit('team created', 'team', 'create', TeamMember.auditCopy(req.user), Team.auditCopy(team))
		.then(function () {
			// Save the new team
			return newTeam.save();
		})
		.then(function(team) {
			// Add creator as first team member with admin role
			return addMemberToTeam(team, req.user, 'admin', req.user);
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
	res.status(200).json(req.team);
};


/**
 * Update the team metadata
 */
module.exports.update = function(req, res) {
	// Retrieve the team from persistence
	let team = req.team;

	// Make a copy of the original team for a "before" snapshot
	let originalTeam = Team.auditCopy(team);

	// Update the updated date
	team.updated = Date.now();

	// Copy in the fields that can be changed by the user
	copyTeamMutableFields(team, req.body);

	// Audit the save action
	auditService.audit('team updated', 'team', 'update', TeamMember.auditCopy(req.user), { before: originalTeam, after: Team.auditCopy(team) })
		.then(function() {
			return team.save();
		})
		.then(function(result) {
			res.status(200).json(result);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};

/**
 * Checks if there are resources that belong to the team
 * @param team The team object of interest
 * @returns A promise that resolves if there are no more resources in the team, and rejects otherwise
 */
function verifyNoResourcesInTeam(team) {
	return q();
}

/**
 * Delete the team
 */
module.exports.delete = function(req, res) {
	// Retrieve the team from persistence
	let team = req.team;

	// Make sure that there are no resources under this team
	verifyNoResourcesInTeam(team)
		.then(function() {
			// Audit the team delete attempt
			return auditService.audit('team deleted', 'team', 'delete', TeamMember.auditCopy(req.user), Team.auditCopy(req.team));
		})
		.then(function() {
			// Delete the team and update all members in the team
			return q.allSettled([
				team.remove(),
				TeamMember.update(
					{'teams._id': team._id },
					{ $pull: { teams: { _id: team._id } } }
				),
				Project.remove({owner: team._id})
			]);
		})
		.then(function() {
			res.status(200).json(team);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Search the teams, includes paging and sorting
 */
module.exports.search = function(req, res) {

	let search = req.body.s || null;
	let roles = req.body.roles || {};
	let query = req.body.q || {};
	query = util.toMongoose(query);

	// Get the limit provided by the user, if there is one.
	// Limit has to be at least 1 and no more than 100.
	let limit = Math.floor(req.query.size);
	if (null == limit || isNaN(limit)) {
		limit = 20;
	}
	limit = Math.max(1, Math.min(1000, limit));

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

	// If user is not an admin, constrain the results to user's teams
	if(null == req.user.roles || !req.user.roles.admin) {
		let userObj = req.user.toObject();
		let teams =  [];

		if (null != userObj.teams && _.isArray(userObj.teams)) {
			teams = userObj.teams.map(function(t) { return t._id.toString(); });
		}

		// If the query already has a filter by team, take the intersection
		if (null != query._id && null != query._id.$in) {
			teams = teams.filter(team => query._id.$in.indexOf(team) > -1);
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

		query._id = {
			$in: teams
		};
	}

	Team.search(query, search, limit, offset, sortArr)
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
 * Search the members of the team
 */
module.exports.searchMembers = function(req, res) {
	let team = req.team;

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

	// Inject the team query parameters
	// Finds members explicitly added to the team using the id OR
	// members implicitly added by having the externalGroup required by requiresExternalTeam
	query = query || {};
	query.$or = [
		{ 'teams._id': team._id },
		{ 'externalGroups': { $in: (_.isArray(team.requiresExternalTeams))? team.requiresExternalTeams : [] } }
	];

	TeamMember.search(query, search, limit, offset, sortArr)
		.then(function(result) {
			// Create the return copy of the users
			let members = [];
			result.results.forEach(function(element){
				members.push(TeamMember.teamCopy(element, team._id));
			});

			// success
			let toReturn = {
				totalSize: result.count,
				pageNumber: page,
				pageSize: limit,
				totalPages: Math.ceil(result.count/limit),
				elements: members
			};

			// Serialize the response
			res.status(200).json(toReturn);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Add a member to a team, defaulting to read-only access
 */
module.exports.addMember = function(req, res) {
	let user = req.userParam;
	let team = req.team;
	let role = req.body.role || 'member';

	addMemberToTeam(team, user, role, req.user)
		.then(function() {
			res.status(204).end();
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Remove a member from a team
 */
module.exports.removeMember = function(req, res) {
	let user = req.userParam;
	let team = req.team;

	removeMemberFromTeam(team, user, req.user)
		.then(function() {
			res.status(204).end();
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


module.exports.updateMemberRole = function(req, res) {
	let user = req.userParam;
	let team = req.team;
	let role = req.body.role || 'member';

	let currentRole = getTeamRole(user, team);
	let updateRolePromise = q();
	if (null != currentRole && currentRole === 'admin') {
		updateRolePromise = verifyNotLastAdmin(user, team);
	}

	updateRolePromise.then(function() {
			return validateTeamRole(role);
		})
		.then(function() {
			return updateMemberRoleInTeam(team, user, role, req.user);
		})
		.then(function() {
			res.status(204).end();
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Team middleware
 */
module.exports.teamById = function(req, res, next, id) {
	Team.findOne({ _id: id })
		.exec()
		.then(function(team) {
			if (null == team) {
				next(new Error('Could not find team: ' + id));
			}
			else {
				req.team = team;
				next();
			}
		}, next);
};


/**
 * Retrieves a batch of Team details for the input IDs
 */
module.exports.teamsByIds = function(ids) {
	// If the ids are empty or null, just return an empty array
	if (null === ids || ids.length === 0) {
		return q([]);
	}
	else {
		return Team.find({ _id: { $in: ids } }).exec();
	}
};


module.exports.teamUserById = function(req, res, next, id) {
	TeamMember.findOne({ _id: id })
		.exec()
		.then(function(user) {
			if (null == user) {
				next(new Error(`Failed to load team member ${id}`));
			}
			else {
				req.userParam = user;
				next();
			}
		}, next);
};


/**
 * Team authorization Middleware
 */

module.exports.getTeamIds = function(user, role) {
	// Validate the user input
	if(null == user) {
		return q.reject({ status: 401, type: 'bad-request', message: 'User does not exist' });
	}

	if (user.constructor.name === 'model') {
		user = user.toObject();
	}

	let userTeams = (_.isArray(user.teams)) ? user.teams : [];
	let filteredTeamIds = userTeams.filter(t => (null != t.role && t.role === role)).map(t => t._id.toString());

	return q(filteredTeamIds);
};

module.exports.getMemberTeamIds = function(user) {
	return q.all([module.exports.getTeamIds(user, 'member'), module.exports.getTeamIds(user, 'editor'), module.exports.getTeamIds(user, 'admin')])
		.then(function(teamIds) {
			return _.union(teamIds[0], teamIds[1], teamIds[2]);
		});
};

module.exports.getEditorTeamIds = function(user) {
	return q.all([module.exports.getTeamIds(user, 'editor'), module.exports.getTeamIds(user, 'admin')])
		.then(function(teamIds) {
			return _.union(teamIds[0], teamIds[1]);
		});
};

module.exports.getAdminTeamIds = function(user) {
	return module.exports.getTeamIds(user, 'admin');
};

// Constrain a set of teamIds provided by the user to those the user actually has access to.
module.exports.filterTeamIds = function(user, teamIds) {
	return exports.getMemberTeamIds(user)
		.then(function(memberTeamIds) {
			// If there were no teamIds to filter by, return all the team ids
			if(null == teamIds || (_.isArray(teamIds) && teamIds.length === 0)) {
				return q(memberTeamIds);
			}
			// Else, return the intersection of the two
			else {
				return q(_.intersection(memberTeamIds, teamIds));
			}
		});
};

module.exports.meetsRoleRequirement = function(user, team, role) {
	// Check role of the user in this team
	let userRole = getActiveTeamRole(user, team);
	if (null != userRole && meetsOrExceedsRole(userRole, role)) {
		return q();
	}
	else {
		return q.reject({ status: 403, type: 'missing-roles', message: 'The user does not have the required roles for the team' });
	}
};

/**
 * Does the user have the referenced role in the team
 */
module.exports.requiresRole = function(role) {
	return function(req) {

		// Verify that the user and team are on the request
		let user = req.user.toObject();
		if(null == user) {
			return q.reject({ status: 400, type: 'bad-request', message: 'No user for request' });
		}
		let team = req.team;
		if(null == team) {
			return q.reject({ status: 400, type: 'bad-request', message: 'No team for request' });
		}

		return module.exports.meetsRoleRequirement(user, team, role);
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
