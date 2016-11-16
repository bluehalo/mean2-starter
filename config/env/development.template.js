'use strict';

/**
 * Copy this file to 'development.js' and selectively pull in first-level properties
 * to override the properties in 'default.js'.
 */
module.exports = {

	/**
	 * System Settings
	 */


	/**
	 * Environment Settings
	 */

	// Basic title and instance name
	app: {
		title: 'MEAN2 UI Development Settings)',
		instanceName: 'mean2ui'
	},

	// Header/footer
	banner: {
		// Show/hide the banner
		showBanner: true,

		// The string to display
		string: 'DEVELOPMENT MEAN2 UI SETTINGS',

		// Code that determines applied header/footer style
		code: 'S'
	},

	// Configuration for outgoing mail server
	mailer: {
		from: process.env.MAILER_FROM || 'USERNAME@GMAIL.COM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'USERNAME@GMAIL.COM',
				pass: process.env.MAILER_PASSWORD || 'PASSWORD'
			}
		}
	}


	/**
	 * Development/debugging settings
	 */


	/**
	 * Logging Settings
	 */


	/**
	 * Not So Environment-Specific Settings
	 */


};
