'use strict';

module.exports = {

	/**
	 * Core System Settings
	 */

	/*
	 * The mode in which the system is operating ('production' | 'development' | 'test')
	 *
	 * 'production':
	 *     Production assets served directly from nodeAngular running in production mode
	 *     Client runs in production mode
	 *
	 * 'development':
	 *     Development assets served from webpack middleware server
	 *     Client runs in development mode
	 *
	 * 'test':
	 *     Meant for running server/client tests
	 */
	mode: 'development',

	// Auth system
	auth: {
		/*
		 * The API Access List grants token/secret-based access to specific endpoints in the application
		 */
		apiAccessList: {
		},

		/*
		 * 'local' strategy uses a locally managed username/password and user profile
		 */
		strategy: 'local',

		/*
		 * 'proxy-pki' strategy assumes that the Node app is behind an SSL terminating
		 * proxy server. The proxy is responsible for passing the DN of the incoming
		 * user in the the 'x-ssl-client-dn' header.
		 */
//		strategy: 'proxy-pki',
//
//		accessChecker: {
//			provider: {
//				file: 'src/server/app/access-checker/providers/example-provider.server.service.js',
//				config: {
//					'/c=us/st=maryland/o=asymmetrik ltd./ou=client/cn=asymmetrikclient': {
//						name: 'Ryan Blace',
//						organization: 'Asymmetrik',
//						email: 'reblace@gmail.com',
//						username: 'reblace'
//					}
//				}
//			},
//			cacheExpire: 1000*60*60*24 // expiration of cache entries
//		},
//
//		autoLogin: true,
//		autoCreateAccounts: true,
//		requiredRoles: ['ROLE'],
//		defaultRoles: { user: true },

		/*
		 * Session settings are required regardless of auth strategy
		 */

		// Session Expiration controls how long sessions can live (in ms)
		sessionCookie: {
			maxAge: 24*60*60*1000
		},

		// Session secret is used to validate sessions
		sessionSecret: 'AJwo4MDj932jk9J5jldm34jZjnDjbnASqPksh4',

		// Session mongo collection
		sessionCollection: 'sessions'

	},

	// Scheduled task runner
	scheduler: {
		services: [
//			{
//				file: 'app/access-checker/server/services/cache-refresh.server.service.js',
//				interval: 5000,
//				config: {
//					refresh: 8*3600000 // 8 Hours
//				}
//			},
			{
				file: './src/server/app/util/schedulers/inactivity-notification.server.service.js',
				interval: 10000, //every 10 seconds
				config: {
					first: 30*86400000,  // 30 days
					second: 60*86400000, // 60 days
					third: 90*86400000 	// 90 days
				}
			},
			{
				file: './src/server/app/util/schedulers/system-resource-cleanup.server.service.js',
				interval: 1800000, // every 30 minutes
				config: {}
			}
		],
		interval: 10000
	},

	// MongoDB
	db: {
		admin: 'mongodb://localhost/mean2-dev'
	},

	// Fallback image if no images are available
	defaultImage: 'src/client/app/img/brand/logo.png',

	/**
	 * Environment Settings
	 */

	// Basic title and instance name
	app: {
		title: 'MEAN2 UI (Default Settings)',
		instanceName: 'mean2ui',
		url: {
			protocol: 'http',
			host: 'localhost',
			port: 3000,
			extra: '/#'
		}
	},

	// Header/footer
	banner: {
		// Show/hide the banner
		showBanner: true,

		// The string to display
		string: 'DEFAULT SETTINGS',

		// Code that determines applied header/footer style
		code: 'U'
	},

	// Copyright footer (shown above the system footer)
	copyright: {
		// Show/hide the banner
		showBanner: true,

		// HTML-enabled contents of the banner
		string: 'Copyright © 2016 <a href="http://www.asymmetrik.com" target="_blank">Asymmetrik, Ltd</a>. All Rights Reserved.'
	},

	contactEmail: process.env.CONTACT_EMAIL || process.env.MAILER_ADMIN || 'noreply@asymmetrik.com',
	newUserEmail: {
		enabled: false,
		email: process.env.MAILER_ADMIN || 'noreply@asymmetrik.com'
	},

	// Use the following for local eventEmitter
	publishProvider: './src/server/app/util/providers/event.server.provider.js',
	socketProvider: './src/server/app/util/sockets/event.server.socket.js',

	// Use the following for Kafka.  Note, must also uncomment Kafka configuration.
	// publishProvider: './src/server/app/util/providers/kafka.server.provider.js',
	// socketProvider: './src/server/app/util/sockets/kafka.server.socket.js',

	messages: {
		topic: 'message.posted'
	},

	notificationExpires: 15552000, // 180 days

	// Configuration for outgoing mail server
	mailer: {
		from: process.env.MAILER_FROM || 'USERNAME@GMAIL.COM',
		admin: process.env.MAILER_ADMIN || 'noreply@asymmetrik.com',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'noreply@asymmetrik.com',
				pass: process.env.MAILER_PASSWORD || 'PASSWORD'
			}
		}
	},


	/**
	 * Development/debugging settings
	 */

	// Enable client (NG2) debug level logging
	clientEnableProdMode: false,

	// Expose server errors to the client (500 errors)
	exposeServerErrors: true,

	// Mongoose query logging
	mongooseLogging: false,

	// Express route logging
	expressLogging: false,

	// Enable automatically reloading the client on changes
	liveReload: {
		port: 35729
	},

	// Set debugger and node inspector ports
	devPorts: {
		karma: 9876,
		debug: 5858,
		webpack: 9000
	},

	// Uncomment below if using Kafka messaging

	// kafka: {
	// 	broker: 'localhost:9092',
	// 	zookeeper: 'localhost:2181',
	// 	zookeeperCommTimeoutMs: 1000,
	// 	kafkaRetryMs: 3000
	// },

	/**
	 * Logging Settings
	 */

	// Application logging and logstash
	logger: {
		application: [
			// Console logger
			{
				stream: process.stdout,
				level: 'info'
			}//,
			// Rotating file logger
			//{
			//	type: 'rotating-file',
			//	level: 'info',
			//	path: '/usr/local/var/log/mean2/application.log',
			//	period: '1d',
			//	count: 1
			//},
			// Logstash logger
			//{
			//	type: 'raw',
			//	level: 'info',
			//	stream: logstash.createStream({
			//		host: 'localhost',
			//		port: 4561
			//	})
			//}
		],
		audit: [
			// Console logger (audit logger must be 'info' level)
			{
				stream: process.stdout,
				level: 'info'
			}//,
			//{
			//	type: 'rotating-file',
			//	level: 'info',
			//	path: '/usr/local/var/log/mean2/audit.log',
			//	period: '1d',
			//	count: 1
			//}
		]
	},

	/*
	 * External links for dashboard
	 */
	welcomeLinks: {
		enabled: true,
		links: [
			{
				title: 'Asymmetrik',
				description: 'Asymmetrik corporate information',
				href: 'http://www.asymmetrik.com'
			}
		]
	},

	/**
	 * Not So Environment-Specific Settings
	 */

	// The port to use for the application (defaults to the environment variable if present)
	port: process.env.PORT || 3000,

	// SocketIO Settings
	socketio: {
		ignoreOlderThan: 600
	},

	// CSV Export Settings
	csv: {
		delayMs: 0
	},

	/*
	 * The maximum number of records allowed to be scanned by a mongo query
	 */
	maxScan: 30000,

	/*
	 * The maximum number of records allowed to be exported to csv
	 */
	maxExport: 1000
};
