'use strict';

var
	path = require('path'),
	q = require('q'),
	_ = require('lodash'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	auditService = deps.auditService,
	util = deps.utilService,

	Group = dbs.admin.model('Group'),
	GroupPermission = dbs.admin.model('GroupPermission'),
	User = dbs.admin.model('User');

/*
 * Local Functions
 */


/**
 * Copies the mutable fields from src to dest
 */
function copyGroupMutableFields(dest, src) {
	dest.title = src.title;
	dest.description = src.description;
	dest.requiresExternalGroups = src.requiresExternalGroups;
}

/**
 * Checks if the user meets the required external groups for the group
 * If the user is bypassed, they automatically meet the required external groups
 * @returns boolean
 */
function meetsRequiredExternalGroups(user, group) {
	if(true === user.bypassAccessCheck) {
		return true;
	} else {
		// Check the required external groups against the user's externalGroups
		return (_.difference(group.requiresExternalGroups, user.externalGroups).length === 0);
	}
}

/**
 * Gets the permission object for the specified user and group
 * @param groupId The id of the group of interest
 * @param user The user object of interest
 * @returns Returns the group permission object or null if none found
 */
function getGroupPermissions(user, group) {
	// Try to find the groupId in the list of groups on the user
	return user.groups.some((gps) => (null != gps._id && gps._id.equals(group._id)));
}

/**
 * Gets the permissions object for the specified user and group
 * and also applies the business logic of if they are implicitly a member
 * of the group or if they are an inactive explicit member of a group
 * @returns a set of permissions roles, or null if the user is not a member of the group
 */
function getActiveGroupPermissions(user, group) {
	// No matter what, we need to get these
	var groupPermissions = getGroupPermissions(user, group);

	// If we are in proxy-pki mode
	if(config.auth.strategy === 'proxy-pki') {

		// If the user is active
		if(meetsRequiredExternalGroups(user, group)) {
			// Return either the group permissions (if they exist), or default permissions
			return (null != groupPermissions)? groupPermissions : { '_id': group._id, roles: {} };
		}
		// The user is inactive
		else {
			// Return null since no matter what, they have no permissions to this group
			return null;
		}
	}
	// We are not in proxy-pki mode
	else {
		// Return the group permissions
		return groupPermissions;
	}
}

/**
 * Checks if the user is the last admin of the group
 * @param user The user object of interest
 * @param group The group object of interest
 * @returns a promise that resolves if the user is not the last admin, and rejects otherwise
 */
function verifyNotLastAdmin(user, group) {

	// Search for all users who have the admin role set to true
	return User.find({
		_id: { $ne: user._id },
		groups: { $elemMatch: { _id: group._id, 'roles.admin': true } }
	})
	.exec()
	.then(function(results) {
		// Just need to make sure we find one active admin who isn't the user
		var adminFound = results.some(function(user) {
			return (null != getActiveGroupPermissions(user, group));
		});

		if(adminFound) {
			return q();
		}
		else {
			return q.reject({ status: 400, type: 'bad-request', message: 'Group must have at least one admin' });
		}

	});
}



/**
 * Helper function to add group permissions to a user
 */
function addUserToGroup(user, group, permissions) {
	// Create the new group permission to apply to the user
	var groupPermission = new GroupPermission({ _id: group._id, roles: permissions });

	// Update the user, then audit the change
	return User.update(
				{ _id: user._id },
				{ $addToSet: { groups: groupPermission } })
		.exec()
		.then(function(result) {
			// Audit the groupPermission delete
			return auditService.audit('group user added', 'group-permission', 'user add',
					User.auditCopy(user),
					Group.auditCopyGroupPermission(group, user))
				.then(function() {
					return q(result);
				});
		});
}


/**
 * Helper function to remove group permission from a user
 */
function removeUserFromGroup(user, group) {
	// Verify the user is not the last admin in the group
	return verifyNotLastAdmin(user, group)
		.then(function() {
			// Apply the update
			return User.update(
					{ _id: user._id },
					{ $pull: { groups: { _id: group._id } } })
			.exec()
			.then(function(updatedUser) {
				// Audit the groupPermission delete
				return auditService.audit('group user removed', 'group-permission', 'user remove',
						User.auditCopy(user),
						Group.auditCopyGroupPermission(group, user))
					.then(function() {
						return q(updatedUser);
					});
			});
		});
}


/**
 * Validates that the roles are one of the accepted values
 */
function validateGroupRole(role) {
	if('admin' === role || 'editor' === role || 'follower' === role) {
		return q();
	}
	else {
		return q.reject({ status: 400, type: 'bad-argument', message: 'Group role does not exist' });
	}
}


/*
 * CRUD Operations
 */

/**
 * Create a new group. The creator is added as an admin
 */
module.exports.create = function(req, res) {

	// Create the new group model
	var newGroup = new Group(req.body);

	// Write the auto-generated metadata
	newGroup.creator = req.user;
	newGroup.created = Date.now();
	newGroup.updated = Date.now();
	newGroup.creatorName = req.user.name;

	// Create the new group and add the user to the group
	newGroup.save()
		.then(function(group) {
			// Audit the creation event
			return auditService.audit('group created', 'group', 'create',
					User.auditCopy(req.user),
					Group.auditCopy(group))
				.then(function() {
					return q(group);
				});
		})
		.then(function(group) {
			return addUserToGroup(req.user, group, { editor: true, admin: true, follower: false });
		})
		.then(function(result) {
			res.status(200).json(result);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();

};


/**
 * Read the group
 */
module.exports.read = function(req, res) {
	res.status(200).json(req.group);
};


/**
 * Update the group metadata
 */
module.exports.update = function(req, res) {
	// Retrieve the group from persistence
	var group = req.group;

	// Make a copy of the original group for a "before" snapshot
	var originalGroup = Group.auditCopy(group);

	// Update the updated date
	group.updated = Date.now();

	// Copy in the fields that can be changed by the user
	copyGroupMutableFields(group, req.body);

	// Save
	group.save().then(function(updatedGroup) {
		// Audit the save action
		return auditService.audit('group updated', 'group', 'update',
				User.auditCopy(req.user),
				{ before: originalGroup, after: Group.auditCopy(group) })
			.then(function() {
				return q(updatedGroup);
			});
	})
	.then(function(result) {
		res.status(200).json(result);
	}, function(err) {
		util.handleErrorResponse(res, err);
	}).done();

};


/**
 * Delete the group
 */
module.exports.delete = function(req, res) {
	var group = req.group;

	// Run the group remove and user update in parallel
	return q.all([
		group.remove,
		User.update(
			{ 'groups._id': group._id },
			{ $pull: { groups: { _id: group._id } } })
	])
	.then(function() {
		// Audit the group delete attempt
		return auditService.audit('group deleted', 'group', 'delete',
				User.auditCopy(req.user),
				Group.auditCopy(req.group));
	})
	.then(function() {
		res.status(200).json(group);
	}, function(err) {
		util.handleErrorResponse(res, err);
	}).done();

};


/**
 * Search the groups, includes paging and sorting
 */
module.exports.search = function(req, res) {
	var query = req.body.q;
	var search = req.body.s;
	var roles = req.body.roles || {};

	var page = req.query.page;
	var size = req.query.size;
	var sort = req.query.sort;
	var dir = req.query.dir;
	var runCount = req.query.runCount !== 'false';

	if(null == size){ size = 1000; }

	// Page needs to be positive and has no upper bound
	if(null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if(null != sort && dir == null){ dir = 'ASC'; }

	// runCount is null then set to true
	if (null == runCount){ runCount = true; }

	// Create the variables to the search call
	var limit = size;
	var offset = page*size;
	var sortArr;
	if(null != sort){
		sortArr = [{ property: sort, direction: dir }];
	}

	// If we aren't an admin, we need to constrain the results
	if(null == req.user.roles || !req.user.roles.admin) {
		// add the group constraint

		var groups = [];

		if(null != req.user.groups) {
			req.user.groups.forEach(function(group) {
				var include = true;

				// Check that the expressed roles in the query actually match the user's real roles
				if (roles.admin && include) {
					include = group.admin;
				}

				if (roles.editor && include) {
					include = group.editor;
				}

				if (roles.follower && include) {
					include = group.follower;
				}

				if(include) {
					groups.push(group.id);
				}
			});
		}

		// Build the query
		query = query || {};

		// If the query already has a filter by group, take the intersection
		if (null != query._id && null != query._id.$in) {
			groups = groups.filter(function(group) {
				return query._id.$in.indexOf(group) > -1;
			});
		}

		// If we were left with no remaining groups, return no results
		if (groups.length === 0) {
			res.json({
				totalSize: 0,
				pageNumber: 0,
				pageSize: size,
				totalPages: 0,
				elements: []
			});
			return;
		}

		query._id = {
			$in: groups
		};
	}

	Group.search(query, search, limit, offset, sortArr, runCount).then(function(result){
		// success
		var toReturn = {
			totalSize: result.count,
			pageNumber: page,
			pageSize: size,
			totalPages: Math.ceil(result.count/size),
			elements: result.results
		};

		// Serialize the response
		res.status(200).json(toReturn);
	}, function(err){
		util.handleErrorResponse(res, err);
	}).done();
};

/**
 * Search the members of the group
 */
module.exports.searchMembers = function(req, res) {
	var group = req.group;

	var query = req.body.q;
	var search = req.body.s;

	var page = req.query.page;
	var size = req.query.size;
	var sort = req.query.sort;
	var dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if(null == size){ size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if(null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if(null != sort && dir == null){ dir = 'DESC'; }

	// Create the variables to the search call
	var limit = size;
	var offset = page*size;
	var sortArr;
	if(null != sort){
		sortArr = [{ property: sort, direction: dir }];
	}

	// Inject the group query parameters
	// Finds users explicitly added to the group using the id OR
	// users implicitly added by having the externalGroup required by requiresExternalGroup
	// TODO: This logic should resemble (bypass && hasPermissions) || (meetsExternalGroups)
	query = query || {};
	query.$or = [
		{'groups._id': group._id},
		{'externalGroups': {$in: group.requiresExternalGroups}}
	];

	User.search(query, search, limit, offset, sortArr).then(function(result){

		// Create the return copy of the users
		var users = [];
		result.results.forEach(function(element){
			users.push(User.groupCopy(element, group._id));
		});

		// success
		var toReturn = {
			totalSize: result.count,
			pageNumber: page,
			pageSize: size,
			totalPages: Math.ceil(result.count/size),
			elements: users
		};

		// Serialize the response
		res.status(200).json(toReturn);
	}, function(err){
		util.handleErrorResponse(res, err);
	}).done();

};


/**
 * Add a user to a group, defaulting to read-only access
 */
module.exports.userAdd = function(req, res) {
	var user = req.userParam;
	var group = req.group;

	return addUserToGroup(
			user,
			group,
			{ editor: false, admin: false, follower: false })
		.then(function() {
			// Audit the addition of the user to the group
			return auditService.audit('group user added', 'group-permission', 'user add',
				User.auditCopy(req.user), Group.auditCopyGroupPermission(group, user));
		})
		.then(function() {
			res.status(204).end();
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();

};


/**
 * Remove a user from a group, removing all their accesses
 */
module.exports.userRemove = function(req, res) {
	var user = req.userParam;
	var group = req.group;

	removeUserFromGroup(user, group)
		.then(function() {
			res.status(204).end();
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


function changeUserRole(user, group, role, add) {
	return validateGroupRole(role)
		.then(function() {
			// Build the set command for setting the role for the group
			var setValue = {};
			setValue['groups.$.roles.' + role] = add;

			return User.update({ _id: user._id, 'groups._id': group._id }, { $set: setValue });
		})
		.then(function(user) {
			// Audit the addition of the user role
			return auditService.audit(
					'group user role ' + (add)? 'added' : 'removed',
					'group-permission',
					'user role ' + (add)? 'add' : 'remove',
					User.auditCopy(user),
					Group.auditCopyGroupPermission(group, user, role));
		});
}


/**
 * Add a group role to a user
 */
module.exports.userRoleAdd = function(req, res) {
	var user = req.userParam;
	var group = req.group;
	var role = req.query.role;

	changeUserRole(user, group, role, true)
		.then(function() {
			res.status(204).end();
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Remove a group role from a user
 */
module.exports.userRoleRemove = function(req, res) {
	var user = req.userParam;
	var group = req.group;
	var role = req.query.role;

	var changeUserRolePromise;

	if(role === 'admin') {
		// If the role is admin, we need to make sure the user isn't the last admin
		changeUserRolePromise = verifyNotLastAdmin(user, group);
	} else {
		changeUserRolePromise = q();
	}

	changeUserRolePromise.then(function() {
			return changeUserRole(user, group, role, false);
		})
		.then(function() {
			res.status(204).end();
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


/**
 * Group middleware
 */
module.exports.groupById = function(req, res, next, id) {
	Group.findOne({ _id: id })
		.exec()
		.then(function(group) {
			if (null == group) {
				next(new Error('Could not find group: ' + id));
			}
			else {
				req.group = group;
				next();
			}
		}, next);
};

/**
 * Retrieves a batch of Group details for the input IDs
 */
module.exports.groupsByIds = function(ids) {
	// If the ids are empty or null, just return an empty array
	if (null === ids || ids.length === 0) {
		return q([]);
	}
	else {
		return Group.find({ _id: { $in: ids } }).exec();
	}
};



/**
 * Group authorization Middleware
 */

module.exports.getGroupIds = function(user) {
	var groupIds = [];
	if (null != user && null != user.groups) {
		groupIds = user.groups.map(function(item) {
			return item.id;
		});
	}
	return groupIds;
};

module.exports.getFollowerGroupIds = function(user) {
	var groupIds = [];
	if (null != user && null != user.groups) {
		user.groups.forEach(function(group) {
			if (group.roles && (group.roles.admin || group.roles.follower)) {
				groupIds.push(group.id);
			}
		});
	}
	return groupIds;
};

module.exports.getEditGroupIds = function(user) {
	var groupIds = [];
	if (null != user && null != user.groups) {
		user.groups.forEach(function(group) {
			if (group.roles && (group.roles.admin || group.roles.editor)) {
				groupIds.push(group.id);
			}
		});
	}
	return groupIds;
};

module.exports.getAdminGroupIds = function(user) {
	var groupIds = [];
	if (null != user && null != user.groups) {
		user.groups.forEach(function(group) {
			if (group.roles && group.roles.admin) {
				groupIds.push(group.id);
			}
		});
	}
	return groupIds;
};

// Constrain a set of groupIds provided by the user to those the user actually has access to.
module.exports.filterGroupIds = function(user, groupIds) {
	var userGroupIds = exports.getGroupIds(user);

	// If no groupIds are provided, return all the groups the user has access to
	if (null == groupIds) {
		return userGroupIds;
	}
	// The user may have requested a subset of groups.  If they did, make sure it is
	// limited to those the user has access to.
	var outGroupIds = [];
	groupIds.forEach(function(id) {
		if (userGroupIds.indexOf(id) >= 0) {
			outGroupIds.push(id);
		}
	});
	return outGroupIds;
};


/**
 * Does the user have the referenced role in the group
 */
module.exports.requiresRole = function(role) {
	return function(req) {

		// Verify that the user and group are on the request
		var user = req.user;
		if(null == user) {
			return q.reject({ status: 400, type: 'bad-request', message: 'No user for request' });
		}
		var group = req.group;
		if(null == group) {
			return q.reject({ status: 400, type: 'bad-request', message: 'No group for request' });
		}

		// Check the user group permissions
		var permissions = getActiveGroupPermissions(user, group);
		if(null != permissions && null != permissions.roles && permissions.roles[role] === true) {
			return q();
		}
		else {
			return q.reject({ status: 403, type: 'missing-roles', message: 'The user does not have the required roles for the group' });
		}
	};
};

exports.requiresAdmin = function(req) {
	return module.exports.requiresRole('admin')(req);
};

exports.requiresEditor = function(req) {
	return module.exports.requiresRole('editor')(req);
};

exports.requiresFollower = function(req) {
	return module.exports.requiresRole('follower')(req);
};

/**
 * Is the user a member of the referenced group?
 * To be a member of a group, the user must have an active group permissions object
 */
module.exports.requiresMember = function(req) {
	var permissions = getActiveGroupPermissions(req.user, req.group);
	if(null != permissions) {
		return q();
	}
	else {
		return q.reject({ status: 403, type: 'missing-group-roles', message: 'The user is not a member of the group' });
	}
};

