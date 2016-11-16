'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
	Server = require('karma').Server;

console.info('Starting initialization of client tests');

new Server({
	configFile: __dirname + '/config/karma.conf.js'
}, function(exitStatus) { 
	process.exit(exitStatus);
}).start();