'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),

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

	return userService.searchAll([{lastLogin: [{$lte: Date.now() - config.first}, {$gt: Date.now() - config.first - config.day}]},
		{lastLogin: [{$lte: Date.now() - config.second}, {$gt: Date.now() - config.second - config.day}]}, {lastLogin: { $lte: Date.now() - config.third}}])
		.then((usersLastLogin) => {
			if (_.isArray(usersLastLogin)) {
				usersLastLogin.forEach((login) => {
					let transporter = nodemailer.createTransport({
						host: 'wildfire.com',
						port: '3000',
						secure: true,
						auth: {
							user:'team@wildfire.com',
							pass: 'password'
						}
					});
					let mail = {
						from: 'Wildfire Team',
						to: usersLastLogin[0].email,
						subject: 'Inactivity Notice',
						text: 'Hello ' + usersLastLogin[0].name + ',\n' + 'It seems you haven\'t logged into your (WF | FH)' +
						'account since ' + new Date(usersLastLogin[0].lastLogin).toISOString() + '. Why not check in and see what\'s new!\n' + '' +
						'Have a question or just want to know what\'s new? Take a look at our Message of the Day page: ' +
						'Keep in mind that all accounts that have been inactive for a period of at least 90 days are removed' +
						'from the system.'

					};
					transporter.sendMail(mail, (error, info) => {
						if (error) {
							return logger.error('Failed to send');
						}
						logger.debug('Email send successful');
					});
				});
				// users[1];
				// users[2];
			}
			return q.all(usersLastLogin);
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to remove inactive users. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
