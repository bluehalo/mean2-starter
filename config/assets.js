'use strict';

module.exports = {

	// Build specific files
	build: [ 'gulpfile.js', 'config/build/!(typings)/**/*.js' ],

	// Test specific source files
	tests: {
		server: [ 'test-server.js', 'src/server/**/*.spec.js' ]
	},

	// Server files
	server: {
		allJS: [ 'config/env/**/*.js', 'config/assets.js', 'config/client-assets.js', 'src/server/**/*.js' ],
		models: [ 'src/server/app/*/models/*.model!(.spec).js', 'src/server/app/**/models/**/*.model!(.spec).js' ],
		controllers: [ 'src/server/app/**/controllers/*.controller!(.spec).js' ],
		routes: [ 'src/server/app/**/routes/*.routes!(.spec).js' ],
		sockets: [ 'src/server/app/**/sockets/**/*.socket!(.spec).js' ],
		config: [ 'src/server/app/**/config/*.config!(.spec).js' ],
		policies: [ 'src/server/app/**/policies/*.policies!(.spec).js' ],
		views: [ 'src/server/app/**/views/**/*.html' ]
	},

	handlebars: {
		viewsDir: 'src/server/app/core/views',
		partialsDir: 'src/server/app/core/views',
		layoutsDir: 'src/server/app/core/views/layouts'
	},

	favicon: 'src/client/app/img/brand/favicon.ico'

};
