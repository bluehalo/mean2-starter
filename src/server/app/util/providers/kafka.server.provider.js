'use strict';

let path = require('path'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	kafkaProducer = deps.kafkaProducer;

exports.publish = function(destination, message, retry) {
	return kafkaProducer.sendMessageForTopic(destination, JSON.stringify(message), retry);
};
