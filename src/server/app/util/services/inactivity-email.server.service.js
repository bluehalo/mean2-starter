'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),
	emailService = deps.emailService,

	deps = require(path.resolve('./src/server/dependencies.js')),
	// dbs = deps.dbs,
	logger = deps.logger,

	nodemailer = require('nodemailer'),
	// User = dbs.admin.model('User'),
	userService = require(path.resolve('./src/server/app/admin/services/users.profile.server.service.js'));


/**
 * alert users who's accounts have been inactive for 30-89 days. Remove accounts that have been inactive for 90+ days
 */
module.exports.run = function(config) {

	let query1 = {lastLogin: {$lte: new Date(Date.now() - config.first), $gt: new Date(Date.now() - config.first - config.day)}};
	let query2 = {lastLogin: {$lte: new Date(Date.now() - config.second), $gt: new Date(Date.now() - config.second - config.day)}};
	let query3 = {lastLogin: { $lte: new Date(Date.now() - config.third)}};
	return q.all([userService.searchAll(query1), userService.searchAll(query2), userService.searchAll(query3)])
		.then((usersLastLogin) => {
			if (_.isArray(usersLastLogin)) {

				logger.info(usersLastLogin[1]);

				let mail = {};
				usersLastLogin[0].forEach((login) => {

					mail = {
						from: '"Wildfire Team" <team@wildfire.com>',
						to: login.email,
						subject: 'Inactivity Notice',
						text: 'Hello ' + login.name + ',\n\n' + 'It seems you haven\'t logged into your (WF | FH) ' +
						'account since ' + new Date(login.lastLogin) + '. Why not check in and see what\'s new!\n' + '' +
						'Have a question or just want to know what\'s new? Take a look at our Message of the Day page: \n' +
						'\nKeep in mind that all accounts that have been inactive for a period of at least 90 days are removed ' +
						'from the system. \n\nThe Wildfire Team'

					};
				});
				usersLastLogin[1].forEach((login) => {
					mail = {
						from: '"Wildfire Team" <team@wildfire.com>',
						to: login.email,
						subject: 'Inactivity Notice',
						text: 'Hello ' + login.name + ',\n\n' + 'It seems you haven\'t logged into your (WF | FH) ' +
						'account since ' + new Date(login.lastLogin) + '. Why not check in and see what\'s new!\n' + '' +
						'Have a question or just want to know what\'s new? Take a look at our Message of the Day page: \n' +
						'\nKeep in mind that all accounts that have been inactive for a period of at least 90 days are removed ' +
						'from the system. \n\nThe Wildfire Team'

					};
				});
				usersLastLogin[2].forEach((login) => {
					mail = {
						from: '"Wildfire Team" <team@wildfire.com>',
						to: login.email,
						subject: 'Account Deactivation',
						text: 'Hello ' + login.name + ',\n\n' + 'It seems you haven\'t logged into your (WF | FH) ' +
						'account since ' + new Date(login.lastLogin) + '.\n' +
						'We are emailing you to let you know that you have been inactive for 90 days and so your account' +
						'has been deactivated.\nPlease contact us if you have any questions. \n\nThe Wildfire Team'
					};
				});
				logger.info(mail);
				return emailService.sendMail(mail)
					.then((result) => {
						logger.debug(`Sent email to: ${bcc}`);
					});
			}
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to remove inactive users. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
