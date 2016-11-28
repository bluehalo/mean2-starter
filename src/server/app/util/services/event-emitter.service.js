let EventEmitter = require('events');

const eventEmitter = new EventEmitter();

function getEventEmitter() {
	return eventEmitter;
}

module.exports = {
	getEventEmitter: getEventEmitter
};
