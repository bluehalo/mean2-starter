'use strict';

/**
 * Module dependencies.
 */
var Server = require('karma').Server;

console.info('Starting initialization of client tests');

new Server({
	configFile: __dirname + '/../karma.conf.js'
}, function(exitStatus) {
	process.exit(exitStatus);
}).start();
