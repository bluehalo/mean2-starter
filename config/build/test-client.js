/* eslint-disable no-console */
'use strict';


let Server = require('karma').Server;

console.info('Starting initialization of client tests');

new Server({
	configFile: __dirname + '/karma/karma.conf.js'
}, function(exitStatus) {
	process.exit(exitStatus);
}).start();
