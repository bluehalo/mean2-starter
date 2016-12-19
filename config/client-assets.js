'use strict';

let
	path = require('path'),
	pkg = require(path.resolve('./package.json'));

module.exports = {

	// Banner for the top of generated assets
	bannerString: '/* @license ' + pkg.name + ' Version: ' + pkg.version + ' Copyright Asymmetrik, Ltd. ' + new Date().getFullYear() + ' - All Rights Reserved.*/\n',

	tests: {
		client: [ 'src/client/**/*.spec.ts' ],
		e2e: [ 'e2e/**/*.spec.js' ]
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
