'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),


	deps = require(path.resolve('./src/server/dependencies.js')),
	configc = deps.config,
	emailService = deps.emailService,
	// dbs = deps.dbs,
	logger = deps.logger,

	// nodemailer = require('nodemailer'),
	// User = dbs.admin.model('User'),
	userService = require(path.resolve('./src/server/app/admin/services/users.profile.server.service.js'));


/**
 * alert users who's accounts have been inactive for 30-89 days. Remove accounts that have been inactive for 90+ days
 */
module.exports.run = function(config) {

	// search for users inactive for 30 days
	let query1 = {lastLogin: {$lte: new Date(Date.now() - config.first), $gt: new Date(Date.now() - config.first - config.day)}};
	// search for users inactive for 60 days
	let query2 = {lastLogin: {$lte: new Date(Date.now() - config.second), $gt: new Date(Date.now() - config.second - config.day)}};
	// search for users inactive for 90 days
	let query3 = {lastLogin: { $lte: new Date(Date.now() - config.third)}};
	return q.all([userService.searchAll(query1), userService.searchAll(query2), userService.searchAll(query3)])
		.then((usersLastLogin) => {
			if (_.isArray(usersLastLogin)) {

				logger.info(usersLastLogin[2]);

				let mailOptions = {};
				if (usersLastLogin[0].length > 0) {
					usersLastLogin[0].forEach((login) => {
						logger.info('first loop');
						mailOptions = {
							from: configc.mailer.from,
							replyTo: configc.mailer.from,
							to: login.email,
							subject: 'Inactivity Notice',
							html: 'Hello ' + login.name + ',\n\n' + 'It seems you haven\'t logged into your (WF | FH) ' +
							'account since ' + new Date(login.lastLogin) + '. Why not check in and see what\'s new!\n' + '' +
							'Have a question or just want to know what\'s new? Take a look at our Message of the Day page: \n' +
							'\nKeep in mind that all accounts that have been inactive for a period of at least 90 days are removed ' +
							'from the system. \n\nThe Wildfire Team'

						};
					});
				}
				if (usersLastLogin[1].length > 0) {
					usersLastLogin[1].forEach((login) => {
						mailOptions = {
							from: configc.mailer.from,
							replyTo: configc.mailer.from,
							to: login.email,
							subject: 'Inactivity Notice',
							html: 'Hello ' + login.name + ',\n\n' + 'It seems you haven\'t logged into your (WF | FH) ' +
							'account since ' + new Date(login.lastLogin) + '. Why not check in and see what\'s new!\n' + '' +
							'Have a question or just want to know what\'s new? Take a look at our Message of the Day page: \n' +
							'\nKeep in mind that all accounts that have been inactive for a period of at least 90 days are removed ' +
							'from the system. \n\nThe Wildfire Team'

						};
					});
				}
				if (usersLastLogin[2].length > 0) {
					usersLastLogin[2].forEach((login) => {
						// logger.info(login);
						mailOptions = {
							from: configc.mailer.from,
							replyTo: configc.mailer.from,
							to: login.email,
							subject: 'Account Deactivation',
							html: 'Hello ' + login.name + ',\n\n' + 'It seems you haven\'t logged into your (WF | FH) ' +
							'account since ' + new Date(login.lastLogin) + '.\n' +
							'We are emailing you to let you know that you have been inactive for 90 days and so your account' +
							' has been deactivated.\nPlease contact us if you have any questions. \n\nThe Wildfire Team'
						};
					});
				}
				// logger.info(mailOptions);
				return emailService.sendMail(mailOptions)
					.then((result) => {
						logger.debug('Sent email');
					});
			}
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to remove inactive users. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
