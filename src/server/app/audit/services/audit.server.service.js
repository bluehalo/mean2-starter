'use strict';

var
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	logger = deps.logger,
	auditLogger = deps.auditLogger;

// Creates an audit entry persisted to Mongo and the bunyan logger
module.exports.audit = function(message, eventType, eventAction, eventActor, eventObject) {
	var defer = q.defer();

	var Audit = dbs.admin.model('Audit');

	// Send to Mongo
	var newAudit = new Audit({
		created: Date.now(),
		message: message,
		audit: {
			auditType: eventType,
			action: eventAction,
			actor: eventActor,
			object: eventObject
		}
	});

	// Send to bunyan logger for logfile persistence
	auditLogger.audit(message, eventType, eventAction, eventActor, eventObject);

	newAudit.save(function(err, result) {
		if(err) {
			logger.error({err: err, audit: newAudit}, 'Error trying to persist audit record to storage.');
			defer.reject(err);
		}
		else {
			defer.resolve(result);
		}
	});

	return defer.promise;
};
