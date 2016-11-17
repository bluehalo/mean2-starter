'use strict';

let
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	util = deps.utilService,
	logger = deps.logger,
	auditService = deps.auditService,

	User = dbs.admin.model('User'),
	UserAgreement = dbs.admin.model('UserAgreement');


// Search (Retrieve) all user Agreements
module.exports.searchEuas = function(req, res) {

	// Handle the query/search/page
	let query = req.body.q;
	let search = req.body.s;

	let page = req.query.page;
	let size = req.query.size;
	let sort = req.query.sort;
	let dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if (null == size) { size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if (null == page) { page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if (null != sort && dir == null) { dir = 'DESC'; }

	// Create the variables to the search call
	let limit = size;
	let offset = page*size;
	let sortArr;
	if (null != sort) {
		sortArr = [{ property: sort, direction: dir }];
	}

	UserAgreement.search(query, search, limit, offset, sortArr)
		.then(function(result) {
			let toReturn = {
				totalSize: result.count,
				pageNumber: page,
				pageSize: size,
				totalPages: Math.ceil(result.count / size),
				elements: result.results
			};

			return q(toReturn);
		}).then(function(results) {
			res.status(200).json(results);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


// Publish the EUA
module.exports.publishEua = function(req, res) {

	// The eua is placed into this parameter by the middleware
	let eua = req.euaParam;
	eua.published = Date.now();

	eua.save().then(function(results) {
		res.status(200).json(results);
	}, function(err) {
		util.handleErrorResponse(res, err);
	}).done();
};


// Accept the current EUA
module.exports.acceptEua = function(req, res) {

	// Make sure the user is logged in
	if (null == req.user) {
		util.handleErrorResponse(res, { status: 400, type: 'error', message: 'User is not signed in' });
	}
	else {
		// Audit accepted eua
		auditService.audit('eua accepted', 'eua', 'accepted', User.auditCopy(user), {})
			.then(function() {
				return User.findOneAndUpdate(
					{ _id: req.user._id },
					{ acceptedEua: Date.now() },
					{ new: true, upsert: false }).exec();
			}).then(function(user) {
				res.status(200).json(User.fullCopy(user));
			}, function(err) {
				util.handleErrorResponse(res, err);
			}).done();
	}
};

// Create a new User Agreement
module.exports.createEua = function(req, res) {

	let eua = new UserAgreement(req.body);
	eua.created = Date.now();
	eua.updated = eua.created;

	// Audit eua creates
	auditService.audit('eua create', 'eua', 'create', User.auditCopy(req.user), UserAgreement.auditCopy(eua))
		.then(function() {
			return eua.save();
		}).then(function(results) {
			res.status(200).json(results);
		}, function(err) {
			util.handleErrorResponse(res, err);
		}).done();
};


// Retrieve the Current User Agreement
module.exports.getCurrentEua = function(req, res) {

	UserAgreement.getCurrentEua()
		.then(function(result) {
			res.status(200).json(results);
		}, function(error){
			util.handleErrorResponse(res, err);
		}).done();
};


// Retrieve the arbitrary User Agreement
module.exports.getEuaById = function(req, res) {

	// The eua is placed into this parameter by the middleware
	let eua = req.euaParam;

	if (null == eua) {
		util.handleErrorResponse(res, { status: 400, type: 'error', message: 'End User Agreement does not exist' });
	}
	else {
		res.status(200).json(eua);
	}
};


// Update a User Agreement
module.exports.updateEua = function(req, res) {

	// The eua is placed into this parameter by the middleware
	let eua = req.euaParam;

	// A copy of the original eua for auditing
	let originalEua = UserAgreement.auditCopy(eua);

	if (null == eua) {
		util.handleErrorResponse(res, { status: 400, type: 'error', message: 'Could not find end user agreement' });
	}
	else {
		// Copy over the new user properties
		eua.text = req.body.text;
		eua.title = req.body.title;

		// Update the updated date
		eua.updated = Date.now();

		// Audit user update
		auditService.audit('end user agreement updated', 'eua', 'update', User.auditCopy(req.user),
			{ before: originalEua, after: UserAgreement.auditCopy(eua) })
			.then(function() {
				return eua.save();
			}).then(function(results) {
				res.status(200).json(results);
			}, function(err) {
				util.handleErrorResponse(res, err);
			}).done();
	}
};


// Delete a User Agreement
module.exports.deleteEua = function(req, res) {

	// The eua is placed into this parameter by the middleware
	let eua = req.euaParam;

	if (null == eua) {
		util.handleErrorResponse(res, { status: 400, type: 'error', message: 'Could not find end user agreement' });
	}
	else {
		// Audit eua delete
		auditService.audit('eua deleted', 'eua', 'delete', User.auditCopy(req.user), UserAgreement.auditCopy(eua))
			.then(function() {
				return eua.remove();
			}).then(function(results) {
				res.status(200).json(results);
			}, function(err) {
				util.handleErrorResponse(res, err);
			}).done();
	}
};


// EUA middleware - stores user corresponding to id in 'euaParam'
module.exports.euaById = function(req, res, next, id) {

	UserAgreement.findOne({
		_id: id
	}).exec(function(err, eua) {
		if (err) return next(err);
		if (!eua) return next(new Error('Failed to load User Agreement ' + id));
		req.euaParam = eua;
		next();
	});
};


/**
 * Check the state of the EUA
 */
module.exports.requiresEua = function(req) {

	return UserAgreement.getCurrentEua()
		.then(function(result) {
			// Compare the current eua to the user's acceptance state
			if (null == result || null == result.published || (req.user.acceptedEua && req.user.acceptedEua >= result.published)) {
				// if the user's acceptance is valid, then proceed
				return q();
			} else {
				return q.reject({ status: 403, type: 'eua', message: 'User must accept end-user agreement.'});
			}
		}, function(error) {
			// Failure
			logger.error(error);
			return q.reject({ status: 500, type: 'error', error: error });
		});
};

