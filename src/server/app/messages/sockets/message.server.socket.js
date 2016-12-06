'use strict';

var path = require('path'),
	nodeUtil = require('util'),

	deps = require(path.resolve('./src/server/dependencies')),
	config = require(path.resolve('./src/server/config')),

	logger = deps.logger,
	socketIO = deps.socketIO,

	socketProvider = require(path.resolve(config.messages.socketProvider)),
	users = require(path.resolve('./src/server/app/admin/controllers/users.server.controller.js'));

/**
 * MessageSocket Socket Controller that overrides Base Socket Controller
 * methods to handle specifics of Messages
 */
function MessageSocket(socketConfig) {
	this._emitType = 'message:data';
	this._topicName = 'message.posted';
	this._subscriptionCount = 0;
	socketProvider.apply(this, arguments);
}

nodeUtil.inherits(MessageSocket, socketProvider);

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

	this.unsubscribe(this.getTopic());

};

/**
 * Handle socket errors
 */
MessageSocket.prototype.error = function(err) {
	logger.error(err, 'MessageSocket: Client connection error');

	this.unsubscribe(this.getTopic());
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
	// If we are no longer listening for anything, unsubscribe
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
