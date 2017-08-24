'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	handlebars = require('handlebars'),
	fs = require('fs'),
	dbs = deps.dbs,

	configc = deps.config,
	emailService = deps.emailService,
	logger = deps.logger,
	User = dbs.admin.model('User');

const day = 86400000;

function buildEmailContent(resource, emailTemplateName, config) {
	let numOfDays = Math.floor((Date.now() - resource.lastLogin)/day);
	let emailData = {
		appName: configc.app.instanceName,
		url: configc.app.baseUrl, // message of the day board
		name: resource.name,
		date: numOfDays,
		contactEmail: configc.contactEmail
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

	let alertQueries = config.alertInterval.map((interval) => ({lastLogin: {$lte: new Date(Date.now() - interval), $gt: new Date(Date.now() - interval - day)}}));

	return q.all(alertQueries.map((query) => User.search(query)))
		.then((usersLastLogin) => {
			if (_.isArray(usersLastLogin)) {
				let mailOptions = {};
				if (usersLastLogin[0].count > 0) {
					usersLastLogin[0].results.forEach((login) => {
						let emailContent = buildEmailContent(login, 'inactivity', config);
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
				if (usersLastLogin[1].count > 0) {
					usersLastLogin[1].results.forEach((login) => {
						let emailContent = buildEmailContent(login, 'inactivity', config);
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
				if (usersLastLogin[2].count > 0) {
					usersLastLogin[2].results.forEach((login) => {
						let emailContent = buildEmailContent(login, 'deactivate', config);

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
								return User.update({'username': login.username}, {$set: {'roles.user': false, 'roles.admin': false}});
							});

					});
				}
			}
			return q();
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to remove inactive users. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
