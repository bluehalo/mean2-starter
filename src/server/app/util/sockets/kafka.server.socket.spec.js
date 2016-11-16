'use strict';

/**
 * Module dependencies.
 */
var
	should = require('should'),
	path = require('path'),

	KafkaSocket = require(path.resolve('./src/server/app/util/sockets/kafka.server.socket.js'));

/**
 * Globals
 */


/**
 * Unit tests
 */
describe('Kafka Socket Controller:', function() {

	var ctrl;

	before(function() {

		// Mock out the subscribe and unsubscribe methods to do nothing
		var noOp = function() {};
		KafkaSocket.prototype.subscribe = noOp;
		KafkaSocket.prototype.unsubscribe = noOp;

		// Initialize
		ctrl = new KafkaSocket({
			socket: {}
		});
	});

	describe('should pass socket through to base', function() {

		it('base socket controller should have the socket object', function() {
			var s = ctrl.getSocket();
			should.exist(s);
		});

	});

	describe('should set default emit values', function() {

		it('default emit message key', function() {
			var key = ctrl.getEmitMessageKey();
			should.not.exist(key);
		});

		it('default emit type', function() {
			var type = ctrl.getEmitType();
			should(type).equal('payload');
		});

	});

});
