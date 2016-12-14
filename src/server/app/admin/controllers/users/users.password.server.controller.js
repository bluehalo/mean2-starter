'use strict';

let
	async = require('async'),
	crypto = require('crypto'),
	nodemailer = require('nodemailer'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	config = deps.config,
	errorHandler = deps.errorHandler,
	logger = deps.logger,

	User = dbs.admin.model('User');


// Initialize the mailer if it has been configured
let smtpTransport;
if (null != config.mailer) {
	smtpTransport = nodemailer.createTransport(config.mailer.options);
}


/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {

	// Make sure that the mailer is configured
	if(null == smtpTransport) {
		let error = { message: 'Email not configured on server.'};
		logger.warn({req: req, error: error}, error.message);
		return res.status(500).json(error);
	}

	// Make sure there is a username
	if(null == req.body.username) {
		return res.status(400).json({ message: 'Username is missing.' });
	}

	logger.info('Password reset request for username: %s', req.body.username);

	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(error, buffer) {
				let token = buffer.toString('hex');
				logger.debug('Generated reset token.');
				done(error, token);
			});
		},

		// Lookup user by username
		function(token, done) {

			// Try to find the user
			User.findOne({
				username: req.body.username
			}, '-salt -password', function(error, user) {

				// If we failed to find the user by username
				if (null != error || null == user) {
					return res.status(400).json({
						message: 'No account with that username has been found.'
					});
				}

				// Generate the token and the expire date/time
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

				logger.debug('Found the user.');

				// Save the user with the token
				user.save(function(error) {
					logger.debug('Saved the user with reset token.');
					done(error, token, user);
				});

			});
		},

		// Generate the email message (from template)
		function(token, user, done) {
			res.render('templates/reset-password-email', {
				name: user.name,
				appName: config.app.title,
				url: `http://${req.headers.host}/#/password/reset/${token}`
			}, function(error, emailHTML) {
				logger.debug('Rendered email.');
				done(error, emailHTML, user);
			});
		},

		// Send the email
		function(emailHTML, user, done) {
			let mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Password Reset',
				html: emailHTML
			};

			smtpTransport.sendMail(mailOptions, function(error) {
				if (null == error) {
					logger.debug('Sent email to: %s', user.email);
					res.json('An email has been sent to ' + user.email + ' with further instructions.');
				} else {
					logger.error({err: error, req: req}, 'Failure sending email.');
					return res.status(400).json({ message: 'Failure sending email.' });
				}

				done(error);
			});
		}
	], function(error) {
		if (error) return next(error);
	});
};


/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
	User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}, function(error, user) {
		if (!user) {
			return res.status('400').json({ message: 'invalid-token' });
		}

		return res.json({ message: 'valid-token' });
	});
};


/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {

	// Init Variables
	let password = req.body.password;

	// Make sure that the mailer is configured
	if(null == smtpTransport) {
		let error = { message: 'Email not configured on server.'};
		logger.warn({req: req, error: error}, error.message);
		return res.status(500).json(error);
	}

	// Make sure there is a username
	if(null == password) {
		return res.status(400).json({ message: 'Password is missing.' });
	}


	async.waterfall([

		function(done) {
			User.findOne({
				resetPasswordToken: req.params.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function(error, user) {

				if(null != error || null == user) {
					return res.status(400).json({
						message: 'Password reset token is invalid or has expired.'
					});
				}
				user.password = password;
				user.resetPasswordToken = undefined;
				user.resetPasswordExpires = undefined;

				user.save(function(error) {
					if (error) {
						return res.status(400).json({
							message: errorHandler.getErrorMessage(error)
						});
					} else {
						req.login(user, function(error) {
							if (error) {
								return res.status(400).json({
									message: errorHandler.getErrorMessage(error)
								});
							} else {
								// Return authenticated user
								res.json(User.fullCopy(user));
								done(error, user);
							}
						});
					}
				});
			});
		},

		function(user, done) {
			res.render('templates/reset-password-confirm-email', {
				name: user.name,
				appName: config.app.title
			}, function(error, emailHTML) {
				done(error, emailHTML, user);
			});
		},

		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			let mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Your password has been changed',
				html: emailHTML
			};

			smtpTransport.sendMail(mailOptions, function(error) {
				done(error, 'done');
			});
		}
	], function(error) {
		if (error) return next(error);
	});
};
