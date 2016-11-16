'use strict';

var logstash = require('bunyan-logstash');

module.exports = {

	/**
	 * System Settings
	 */

	// The assets to use ('production' | 'development')
	mode: 'production',

	// Auth system
	auth: {

		/*
		 * 'local' strategy uses a locally managed username/password and user profile
		 */
		strategy: 'local',

		/*
		 * Session settings are required regardless of auth strategy
		 */

		// Session Expiration controls how long sessions can live (in ms)
		sessionCookie: {
			maxAge: 24*60*60*1000
		},

		// Session mongo collection
		sessionCollection: 'sessions'

	},

	// MongoDB
	db: {
		admin: 'mongodb://localhost/mean2'
	},


	/**
	 * Environment Settings
	 */

	// Basic title and instance name
	app: {
		title: 'MEAN2 UI',
		instanceName: 'mean2ui'
	},

	// Header/footer
	banner: {
		showBanner: false
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
	},


	/**
	 * Development/debugging settings
	 */

	// Enable client (NG2) debug level logging
	clientEnableProdMode: true,

	// Expose server errors to the client (500 errors)
	exposeServerErrors: false,

	// Mongoose query logging
	mongooseLogging: false,

	// Express route logging
	expressLogging: false,

	// Enable automatically reloading the client on changes
	liveReload: false,


	/**
	 * Logging Settings
	 */

	// Application logging and logstash
	logger: {
		application: [
			// Console logger
			{
				stream: process.stdout,
				level: 'warn'
			},
			// Rotating file logger
			{
				type: 'rotating-file',
				level: 'warn',
				path: '/var/log/mean2/application.log',
				period: '1d',
				count: 1
			},
			// Logstash logger
			{
				type: 'raw',
				level: 'info',
				stream: logstash.createStream({
					host: 'localhost',
					port: 4561
				})
			}
		],
		audit: [
			// Console logger (audit logger must be 'info' level)
			{
				stream: process.stdout,
				level: 'info'
			},
			// Rotating file logger
			{
				type: 'rotating-file',
				level: 'info',
				path: '/usr/local/var/log/mean2/audit.log',
				period: '1d',
				count: 7
			}
		]
	}


	/**
	 * Not So Environment-Specific Settings
	 */

};
