'use strict';

let path = require('path'),
	q = require('q'),

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

// Login the user
function login(user, req, res) {
	userAuthService.login(user, req)
		.then(
			(result) => {
				res.status(200).json(result);
			},
			(err) => {
				util.handleErrorResponse(res, err);
			})
		.done();
}

//Authenticate and login the user. Passport handles authentication.
function authenticateAndLogin(req, res, next) {
	userAuthService.authenticateAndLogin(req)
		.then(
			(result) => {
				res.status(200).json(result);
			},
			(err) => {
				util.handleErrorResponse(res, err);
			})
		.done();
}

// Admin creates a user
function adminCreateUser(user, req, res) {
	// Initialize the user
	userAuthService.initializeNewUser(user)
		.then(
			(result) => {
				return result.save();
			})
		.then(
			(result) => {
				return auditService.audit('admin user create', 'user', 'admin user create',
					User.auditCopy(req.user, util.getHeaderField(req.headers, 'x-real-ip')), User.auditCopy(result), req.headers)
					.then(
						() => {
							return q(result);
						});
			})
		.then(
			(result) => {
				res.status(200).json(User.fullCopy(result));
			},
			(err) => {
				util.handleErrorResponse(res, err);
			})
		.done();
}


// Signup the user - creates the user object and logs in the user
function signup(user, req, res) {
	// Initialize the user
	userAuthService.initializeNewUser(user)
		.then(
			(result) => {
				return user.save();
			})
		.then(
			(newUser) => {
				return auditService.audit('user signup', 'user', 'user signup', {}, User.auditCopy(newUser), req.headers)
					.then(
						() => {
							return q(newUser);
						});
			})
		.then(
			(newUser) => {
				login(newUser, req, res);
			},
			(err) => {
				util.handleErrorResponse(res, err);
			})
		.done();
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
exports.signup = (req, res) => {
	let user = new User(User.createCopy(req.body));
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
exports.proxyPkiSignup = (req, res) => {
	let dn = req.headers[config.auth.header];
	if (null == dn) {
		res.status('400').json({ message: 'Missing PKI information.' });
		return;
	}

	let user = new User(User.createCopy(req.body));
	user.providerData = { dn: dn, dnLower: dn.toLowerCase() };
	user.username = dn; //TODO: extract the username
	user.provider = 'pki';

	signup(user, req, res);
};


/**
 * Admin Create a User (Local Strategy)
 */
exports.adminCreateUser = (req, res) => {
	let user = new User(User.createCopy(req.body));
	user.bypassAccessCheck = req.body.bypassAccessCheck;
	user.roles = req.body.roles;
	user.provider = 'local';

	// Need to set null passwords to empty string for mongoose validation to work
	if (null == user.password) {
		user.password = '';
	}

	adminCreateUser(user, req, res);
};


/**
 * Admin Create a User (Pki Strategy)
 */
exports.adminCreateUserPki = (req, res) => {
	let user = new User(User.createCopy(req.body));
	user.bypassAccessCheck = req.body.bypassAccessCheck;
	user.roles = req.body.roles;

	if (null != req.body.username) {
		user.username = req.body.username;
		user.providerData = { dn: req.body.username, dnLower: req.body.username.toLowerCase() };
	}
	user.provider = 'pki';

	adminCreateUser(user, req, res);
};


/**
 * Local Signin
 */
exports.signin = (req, res, next) => {
	authenticateAndLogin(req, res, next);
};


/**
 * Signout - logs the user out and redirects them
 */
exports.signout = (req, res) => {
	req.logout();
	res.redirect('/');
};

