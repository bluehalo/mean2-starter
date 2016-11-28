'use strict';

let path = require('path'),
	eventEmitter = require(path.resolve('./src/server/app/util/services/event-emitter.service.js'));

exports.publish = function(destination, message, retry) {
	eventEmitter.getEventEmitter().emit(destination, message);
};
