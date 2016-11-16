'use strict';

var
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	config = deps.config,
	util = deps.utilService,
	auditService = deps.auditService,

	userAuthService = require(path.resolve('./src/server/app/admin/services/users.authentication.server.service.js')),
	User = dbs.admin.model('User');


/**
 * ==========================================================
 * Private methods
 * ==========================================================
 */

//Login the user
function login(user, req, res) {
	userAuthService.login(user, req).then(function(result) {
		res.status(200).json(result);
	}, function(errorResult) {
		util.handleErrorResponse(res, errorResult);
	});
}

//Authenticate and login the user. Passport handles authentication.
function authenticateAndLogin(req, res, next) {
	userAuthService.authenticateAndLogin(req).then(function(result) {
		res.status(200).json(result);
	}, function(errorResult) {
		util.handleErrorResponse(res, errorResult);
	}).done();
}

// Admin creates a user
function adminCreateUser(user, req, res) {

	// Initialize the user
	userAuthService.initializeNewUser(user).then(function(result) {

		// Save the new user
		result.save(function(err) {
			util.catchError(res, err, function() {
				// Audit admin creates
				auditService.audit('admin user create', 'user', 'admin user create',
					User.auditCopy(req.user),
					User.auditCopy(result));

				// Return a full copy of the user
				res.json(User.fullCopy(result));
			});
		});
	}).done();
}


//Signup the user - creates the user object and logs in the user
function signup(user, req, res) {

	// Initialize the user
	userAuthService.initializeNewUser(user).then(function(result) {

		// Then save the user
		user.save(function(err, newUser) {
			if(null != err) {
				util.handleErrorResponse(res, err);
			}
			else {
				// Audit user signup
				auditService.audit('user signup', 'user', 'user signup',
					{},
					User.auditCopy(newUser));

				// Attempt to login
				login(newUser, req, res);
			}
		});

	}).done();
}



/**
 * ==========================================================
 * Public Methods
 * ==========================================================
 */

/**
 * Local Signup strategy. Provide a username/password
 * and user info in the request body.
 */
exports.signup = function(req, res) {
	var user = new User(User.createCopy(req.body));
	user.provider = 'local';

	// Need to set null passwords to empty string for mongoose validation to work
	if(null == user.password) {
		user.password = '';
	}

	signup(user, req, res);
};


/**
 * Proxy PKI signup. Provide a DN in the request header
 * and then user info in the request body.
 */
exports.proxyPkiSignup = function(req, res) {
	var dn = req.headers[config.auth.header];
	if(null == dn) {
		res.status('400').json({ message: 'Missing PKI information.' });
		return;
	}

	var user = new User(User.createCopy(req.body));
	user.providerData = { dn: dn, dnLower: dn.toLowerCase() };
	user.username = dn; //TODO: extract the username
	user.provider = 'pki';

	signup(user, req, res);
};


/**
 * Admin Create a User (Local Strategy)
 */
exports.adminCreateUser = function(req, res) {
	var user = new User(User.createCopy(req.body));
	user.bypassAccessCheck = req.body.bypassAccessCheck;
	user.roles = req.body.roles;
	user.provider = 'local';

	// Need to set null passwords to empty string for mongoose validation to work
	if(null == user.password) {
		user.password = '';
	}

	adminCreateUser(user, req, res);
};


/**
 * Admin Create a User (Pki Strategy)
 */
exports.adminCreateUserPki = function(req, res) {
	var user = new User(User.createCopy(req.body));
	user.bypassAccessCheck = req.body.bypassAccessCheck;
	user.roles = req.body.roles;

	if(null != req.body.username) {
		user.username = req.body.username;
		user.providerData = { dn: req.body.username, dnLower: req.body.username.toLowerCase() };
	}
	user.provider = 'pki';

	adminCreateUser(user, req, res);
};


/**
 * Local Signin
 */
exports.signin = function(req, res, next) {
	authenticateAndLogin(req, res, next);
};


/**
 * Signout - logs the user out and redirects them
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

