'use strict';

let
	path = require('path'),
	pkg = require(path.resolve('./package.json'));

module.exports = {

	// Banner for the top of generated assets
	bannerString: '/* @license ' + pkg.name + ' Version: ' + pkg.version + ' Copyright Asymmetrik, Ltd. ' + new Date().getFullYear() + ' - All Rights Reserved.*/\n',

	// Build specific files
	build: [ 'gulpfile.js', 'config/build/!(typings)/**/*.js' ],

	// Test specific source files
	tests: {
		client: [ 'test-client.js', 'src/client/**/*.spec.ts' ],
		server: [ 'test-server.js', 'src/server/**/*.spec.js' ],
		e2e: [ 'e2e/**/*.spec.js' ]
	},

	// Server files
	server: {
		allJS: [ 'config/env/**/*.js', 'config/assets.js', 'src/server/**/*.js' ],
		models: [ 'src/server/app/*/models/**/*.model!(.spec).js', 'src/server/app/**/*/models/**/*.model!(.spec).js' ],
		controllers: [ 'src/server/app/*/models/**/*.controller!(.spec).js' ],
		routes: [ 'src/server/app/!(core)/routes/*.routes!(.spec).js', 'src/server/app/core/routes/*!(.spec).js', 'src/server/app/**/*/routes/*.routes!(.spec).js' ],
		sockets: [ 'src/server/app/*/sockets/*.sockets!(.spec).js' ],
		config: [ 'src/server/app/*/config/*.config!(.spec).js' ],
		policies: [ 'src/server/app/*/policies/*.policies!(.spec).js' ],
		views: [ 'src/server/app/*/views/**/*.html' ]
	},

	// Client files
	client: {

		/*
		 * Application files
		 *  - Includes all source files as well as paths/globs for dist files
		 */
		app: {
			src: {
				sass: [ 'src/client/**/*.scss' ],
				ts: [ 'src/client/**/*.ts' ]
			},

			dist: {
				development: {
					css: [ 'public/dev/application.css' ],
					js: [
						// Don't need references to bundles since they're hardcoded in the index template in dev mode
					]
				},
				production: {
					css: [ 'public/application.+([0-9a-f]).min.css' ],
					js: [
						'public/vendor?(.)*([0-9a-f]).js',
						'public/application?(.)*([0-9a-f]).js'
					]
				}
			},

			views: [ 'src/client/**/*.html' ],
			content: [ 'src/client/**/*.@(png|jpg|bmp|gif|svg|tiff)' ]
		}

	}
};
