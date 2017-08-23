'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),
	handlebars = require('handlebars'),
	fs = require('fs'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	configc = deps.config,
	emailService = deps.emailService,
	logger = deps.logger,

	userService = require(path.resolve('./src/server/app/admin/services/users.profile.server.service.js'));


function buildEmailContent(resource, emailTemplateName) {

	let emailData = {
		appName: 'Wildfire',
		url: 'www.google.com', // message of the day board
		name: resource.name,
		date: new Date(resource.lastLogin)
	};

	let emailHTML = fs.readFileSync(`./src/server/app/util/templates/${emailTemplateName}-email.server.view.html`, 'utf-8');

	let template = handlebars.compile(emailHTML);
	emailHTML = template(emailData);
	return emailHTML;
}

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

				let mailOptions = {};
				if (usersLastLogin[0].length > 0) {
					usersLastLogin[0].forEach((login) => {
						let emailContent = buildEmailContent(login, 'inactivity');
						mailOptions = {
							from: configc.mailer.from,
							replyTo: configc.mailer.from,
							to: login.email,
							subject: 'Inactivity Notice',
							html: emailContent
						};
						return emailService.sendMail(mailOptions)
							.then((result) => {
								logger.debug('Sent email');
							});
					});
				}
				if (usersLastLogin[1].length > 0) {
					usersLastLogin[1].forEach((login) => {
						let emailContent = buildEmailContent(login, 'inactivity');
						mailOptions = {
							from: configc.mailer.from,
							replyTo: configc.mailer.from,
							to: login.email,
							subject: 'Inactivity Notice',
							html: emailContent
						};
						return emailService.sendMail(mailOptions)
							.then((result) => {
								logger.debug('Sent email');
							});
					});
				}
				if (usersLastLogin[2].length > 0) {
					usersLastLogin[2].forEach((login) => {
						let emailContent = buildEmailContent(login, 'deactivate');

						mailOptions = {
							from: configc.mailer.from,
							replyTo: configc.mailer.from,
							to: login.email,
							subject: 'Account Deactivation',
							html: emailContent
						};
						return emailService.sendMail(mailOptions)
							.then((result) => {
								logger.debug('Sent email');
								// deactivate user
								let query = {$set: {'roles.user': false, 'roles.admin': false}};
								return q(userService.updateUser(query));
							});

					});
				}
			}
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to remove inactive users. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
