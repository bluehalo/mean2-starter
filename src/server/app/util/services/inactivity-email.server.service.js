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

function buildEmailTemplateName(alertType) {
	if (alertType && typeof alertType === 'string') {
		switch (alertType) {
			case alertTypeStrings.reconImageMatch:
			case alertTypeStrings.reconFuzzyMatch:
				return 'recon-match';
			case alertTypeStrings.seedActivity:
			case alertTypeStrings.savedSearchActivity:
			case alertTypeStrings.profileChange:
			default:
				return alertType;
		}
	}

	return 'no-template';
}
function buildEmailUrl(notification, resource) {
	if (notification) {
		switch (notification.alertType) {
			case alertTypeStrings.reconImageMatch:
			case alertTypeStrings.reconFuzzyMatch:
				if (resource && resource._id) {
					return `${config.app.baseUrl}/reconstitution/${resource._id}`;
				}
				break;
			case alertTypeStrings.seedActivity:
				return `${config.app.baseUrl}/summary/seed/${notification.seedId}?startTime=${notification.start}&stopTime=${notification.end}&selectedTab=messages`;
			case alertTypeStrings.savedSearchActivity:
				return `${config.app.baseUrl}/summary/saved-search/${notification.resource}?startTime=${notification.start}&stopTime=${notification.end}&selectedTab=messages`;
			case alertTypeStrings.profileChange:
				return `${config.app.baseUrl}/summary/seed/${notification.seedId}?startTime=${notification.start}&stopTime=${notification.end}&selectedTab=seed-changes`;
		}
	}

	return config.app.baseUrl;
}

function buildEmailData(notification, resource) {
	let emailData = {
		appName: config.app.title,
		url: buildEmailUrl(notification, resource)
	};

	if (resource) {
		emailData.resourceName = resource.title;
	}

	if (notification) {
		switch (notification.alertType) {
			case alertTypeStrings.reconImageMatch:
				emailData.seedId = notification.seedId;
				emailData.reconType = 'Profile Image';
				break;
			case alertTypeStrings.reconFuzzyMatch:
				emailData.seedId = notification.seedId;
				emailData.reconType = 'Screenname';
				break;
			case alertTypeStrings.seedActivity:
				emailData.seedId = notification.seedId;
				break;
			case alertTypeStrings.savedSearchActivity:
				break;
			case alertTypeStrings.profileChange:
				emailData.seedId = notification.seedId;
		}
	}

	return emailData;
}


function buildEmailContent(notification, resource) {
	let defer = q.defer();

	let emailData = buildEmailData(notification, resource);
	let emailTemplateName = buildEmailTemplateName(notification ? notification.alertType: undefined);

	fs.readFile(`src/server/app/firehawk/dispatcher/templates/alert-${emailTemplateName}-email.server.view.html`, 'utf-8', (error, source) => {
		if (error) {
			defer.reject(error);
		} else {
			let template = handlebars.compile(source);
			let emailHTML = template(emailData);

			defer.resolve(emailHTML);
		}
	});

	return defer.promise;
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
						return emailService.sendMail(mailOptions)
							.then((result) => {
								logger.debug('Sent email');
							});
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
						return emailService.sendMail(mailOptions)
							.then((result) => {
								logger.debug('Sent email');
							});
					});
				}
				if (usersLastLogin[2].length > 0) {
					usersLastLogin[2].forEach((login) => {
						// logger.info(login.name);
						let emailPromises = [buildEmailContent()]
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
						return emailService.sendMail(mailOptions)
							.then((result) => {
								logger.debug('Sent email');
								// deactivate user
								let query = {$set: {'roles.user': false, 'roles.admin': false}};
								return q(userService.updateUser(query));
							});

					});
				}
				// logger.info(mailOptions);

			}
		})
		.fail((err) => {
			logger.error(`Failed scheduled run to remove inactive users. Error=${JSON.stringify(err)}`);
			return q.reject(err);
		});

};
