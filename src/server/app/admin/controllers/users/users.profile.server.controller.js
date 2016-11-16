
'use strict';

var _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	util = deps.utilService,
	logger = deps.logger,
	auditService = deps.auditService,

	User = dbs.admin.model('User');

/**
 * Private methods
 */

function searchUsers(req, res, copyUserFn) {

	// Handle the query/search/page
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

	User.search(query, search, limit, offset, sortArr).then(function(result){

		// Create the return copy of the users
		var users = [];
		result.results.forEach(function(element){
			users.push(copyUserFn(element));
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
	}, function(error){
		// failure
		logger.error(error);
		return util.send400Error(res, error);
	});
}


/**
 * Standard User Operations
 */

// Get Current User
exports.getCurrentUser = function(req, res) {

	// The user that is a parameter of the request is stored in 'userParam'
	var user = req.user;

	if(null == user){
		res.status(400).json({
			message: 'User not logged in'
		});
		return;
	}

	res.status(200).json(User.fullCopy(user));
};


// Update Current User
exports.updateCurrentUser = function(req, res) {

	// Make sure the user is logged in
	if(null == req.user){
		res.status(400).json({
			message: 'User is not signed in'
		});
		return;
	}

	// Get the full user (including the password)
	User.findOne({
		_id: req.user._id
	}).exec(function(err, user) {

		var originalUser = User.auditCopy(user);

		// Copy over the new user properties
		user.name = req.body.name;
		user.organization = req.body.organization;
		user.email = req.body.email;
		user.phone = req.body.phone;
		user.username = req.body.username;

		// Update the updated date
		user.updated = Date.now();

		// If they are changing the password, verify the current password
		if(_.isString(req.body.password) && !_.isEmpty(req.body.password)) {
			if(!user.authenticate(req.body.currentPassword)) {

				// Audit failed authentication
				auditService.audit('user update authentication failed', 'user', 'update authentication failed',
					User.auditCopy(req.user), {});

				res.status(400).json({
					message: 'Current password invalid'
				});
				return;
			}

			// We passed the auth check and we're updating the password
			user.password = req.body.password;
		}

		// Save the user
		user.save(function(err) {
			util.catchError(res, err, function() {
				// Remove the password/salt
				delete user.password;
				delete user.salt;

				// Audit user update
				auditService.audit('user updated', 'user', 'update',
					User.auditCopy(req.user),
					{ before: originalUser, after: User.auditCopy(user) });

				// Log in with the new info
				req.login(user, function(err) {
					if (err) {
						res.status(400).json(err);
					} else {
						res.status(200).json(User.fullCopy(user));
					}
				});
			});
		});

	});
};


// Get a filtered version of a user by id
exports.getUserById = function(req, res) {

	// The user that is a parameter of the request is stored in 'userParam'
	var user = req.userParam;

	if(null == user){
		res.status(400).json({
			message: 'User does not exist'
		});
		return;
	}

	res.status(200).json(User.filteredCopy(user));
};

// Search for users (return filtered version of user)
exports.searchUsers = function(req, res) {
	searchUsers(req, res, User.filteredCopy);
};

// Match users given a search fragment
exports.matchUsers = function(req, res) {
	// Handle the query/search/page
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
	if(null != sort && dir == null){ dir = 'ASC'; }

	// Create the variables to the search call
	var limit = size;
	var offset = page*size;
	var sortArr;
	if(null != sort){
		sortArr = [{ property: sort, direction: dir }];
	}

	User.containsQuery(query, ['name', 'username', 'email'], search, limit, offset, sortArr).then(function(result){

		// Create the return copy of the users
		var users = [];
		result.results.forEach(function(element){
			users.push(User.filteredCopy(element));
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
	}, function(error){
		// failure
		logger.error(error);
		return util.send400Error(res, error);
	});
};



/**
 * Admin User Operations
 */

// Admin Get a User
exports.adminGetUser = function(req, res) {

	// The user that is a parameter of the request is stored in 'userParam'
	var user = req.userParam;

	if(null == user){
		res.status(400).json({
			message: 'User is not signed in'
		});
		return;
	}

	res.status(200).json(User.fullCopy(user));
};

//Admin Get All Users
exports.adminGetAll = function(req, res) {

	// The field that the admin is requesting is a query parameter
	var field = req.body.field;
	if( null == field || field.length === 0 ) {
		res.status(500).json({
			message: 'Query field must be provided'
		});
	}

	var query = req.body.query;

	logger.debug('Querying Users for %s', field);
	var proj = {};
	proj[field] = 1;
	User.find(util.toMongoose(query), proj)
		.exec(function(error, results) {

			if(null != error) {
				// failure
				logger.error(error);
				return util.send400Error(res, error);
			}

			res.status(200).json(results.map(function(r) { return r[field]; }));
		});
};

// Admin Update a User
exports.adminUpdateUser = function(req, res) {

	// The persistence user
	var user = req.userParam;

	// A copy of the original user for auditing
	var originalUser = User.auditCopy(user);

	if(null == user){
		res.status(400).json({
			message: 'Could not find user'
		});
		return;
	}

	// Copy over the new user properties
	user.name = req.body.name;
	user.organization = req.body.organization;
	user.email = req.body.email;
	user.phone = req.body.phone;
	user.username = req.body.username;
	user.roles = req.body.roles;
	user.bypassAccessCheck = req.body.bypassAccessCheck;

	if(_.isString(req.body.password) && !_.isEmpty(req.body.password)) {
		user.password = req.body.password;
	}


	// Update the updated date
	user.updated = Date.now();

	// Save the user
	user.save(function(err) {
		util.catchError(res, err, function() {
			// Audit user update
			auditService.audit('admin user updated', 'user', 'admin update',
				User.auditCopy(req.user),
				{ before: originalUser, after: User.auditCopy(user) });

			res.status(200).json(User.fullCopy(user));
		});
	});
};


// Admin Delete a User
exports.adminDeleteUser = function(req, res) {
	// Init Variables
	var user = req.userParam;

	if(null == user){
		res.status(400).json({
			message: 'Could not find user'
		});
		return;
	}

	// Delete the user
	user.remove(function(err) {
		util.catchError(res, err, function() {
			// Audit user delete
			auditService.audit('admin user deleted', 'user', 'admin delete',
				User.auditCopy(req.user),
				User.auditCopy(user));

			res.status(200).json(User.fullCopy(user));
		});
	});
};


// Admin Search for Users
exports.adminSearchUsers = function(req, res) {
	searchUsers(req, res, User.fullCopy);
};

function canEditProfile(authStrategy, user) {
	return authStrategy !== 'proxy-pki' || user.bypassAccessCheck === true;
}

exports.canEditProfile = canEditProfile;

// Are allowed to edit user profile info
exports.hasEdit = function(req) {
	var defer = q.defer();

	if (canEditProfile(config.auth.strategy, req.user)) {
		defer.resolve();
	}
	else {
		defer.reject({ status: 403, type: 'not-authorized', message: 'User not authorized to edit their profile' });
	}

	return defer.promise;
};
