'use strict';

let path = require('path'),
	q = require('q'),
	nodemailer = require('nodemailer'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	logger = deps.logger;

// Initialize the mailer if it has been configured
let smtpTransport;
if (config.mailer) {
	smtpTransport = nodemailer.createTransport(config.mailer.options);
}

/**
 * Detects issues with mailOptions
 * returns an array of fields missing from mailOptions
 */
function getMissingMailOptions(mailOptions) {
	let requiredOptions = [
		'to',
		'from',
		'subject',
		'html'
	];

	let missingOptions = [];

	requiredOptions.forEach((option) => {
		if (!mailOptions[option]) {
			missingOptions.push(option);
		}
	});

	return missingOptions;
}

module.exports.getMissingMailOptions = getMissingMailOptions;

module.exports.sendMail = (mailOptions) => {
	let defer = q.defer();

	// Make sure that the mailer is configured
	if (!smtpTransport) {
		defer.reject({ message: 'Email server is not configured' });
		return defer.promise;
	}

	// Make sure mailOptions are specified
	if (!mailOptions) {
		defer.reject({ message: 'No email options specified' });
		return defer.promise;
	}

	// Make sure all the required mailOptions are defined
	let missingOptions = getMissingMailOptions(mailOptions);
	if (missingOptions.length > 0) {
		defer.reject({ message: `The following required values were not specified in mailOptions: ${missingOptions.join(', ')}`});
		return defer.promise;
	}

	smtpTransport.sendMail(mailOptions, (error) => {
		if (!error) {
			logger.debug(`Sent email to: ${mailOptions.to}`);
			defer.resolve(mailOptions);
		}
		else {
			logger.error('Failure sending email.');
			defer.reject(error);
		}
	});

	return defer.promise;
};
