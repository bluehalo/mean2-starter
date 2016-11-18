'use strict';

var path = require('path'),
	nodeUtil = require('util'),

	deps = require(path.resolve('./config/dependencies.js')),
	logger = deps.logger,
	socketIO = deps.socketIO,

	KafkaSocket = require(path.resolve('./app/util/server/sockets/kafka.server.socket.js')),
	users = require(path.resolve('./app/users/server/controllers/users.server.controller.js'));

/**
 * MessageSocket Socket Controller that overrides Base Socket Controller
 * methods to handle specifics of Messages
 */
function MessageSocket(config) {
	this._emitType = 'message:data';
	this._topicName = 'message.posted';
	this._subscriptionCount = 0;
	KafkaSocket.apply(this, arguments);
}

nodeUtil.inherits(MessageSocket, KafkaSocket);

MessageSocket.prototype.name = 'MessageSocket';

/**
 * @override
 *
 */
MessageSocket.prototype.getEmitMessageKey = function() {
	return '';
};

/**
 * Returns the topic for a user ID.
 */
MessageSocket.prototype.getTopic = function(userId) {
	return this._topicName;
};

/**
 * Handle socket disconnects
 */
MessageSocket.prototype.disconnect = function() {
	logger.info('MessageSocket: Disconnected from client.');

	clearInterval(this.intervalId);

};

/**
 * Handle socket errors
 */
MessageSocket.prototype.error = function(err) {
	logger.error(err, 'MessageSocket: Client connection error');

	clearInterval(this.intervalId);
};

/**
 *
 */
MessageSocket.prototype.handleSubscribe = function(payload) {
	var self = this;

	if(logger.debug()) {
		logger.debug('MessageSocket: message:subscribe event with payload: %s', JSON.stringify(payload));
	}

	// Check that the user account has access
	self.applyMiddleware([
		users.hasAccess
	]).then(function () {
		// Subscribe to the user's message topic
		var topic = self.getTopic();
		self.subscribe(topic);
		self._subscriptionCount++;
	}, function (err) {
		logger.warn('Unauthorized access to notifications by inactive user %s: %s', self.getUserId(), err);
	});
};

/**
 *
 */
MessageSocket.prototype.handleUnsubscribe = function(payload) {
	if(logger.debug()) {
		logger.debug('MessageSocket: message:unsubscribe event with payload: %s', JSON.stringify(payload));
	}

	var topic = this.getTopic();
	this.unsubscribe(topic);

	this._subscriptionCount = Math.max(0, this._subscriptionCount - 1);
	// If we are no longer listening for anything, unsubscribe from Kafka
	if (this._subscriptionCount === 0) {
		this.unsubscribe(this.getTopic());
	}
};

/**
 *
 */
MessageSocket.prototype.addListeners = function() {
	var s = this.getSocket();

	if(typeof s.on === 'function') {
		// Set up Subscribe events
		s.on('message:subscribe', this.handleSubscribe.bind(this));

		// Set up Unsubscribe events
		s.on('message:unsubscribe', this.handleUnsubscribe.bind(this));
	}
};

socketIO.registerSocketListener(MessageSocket);

module.exports = MessageSocket;
