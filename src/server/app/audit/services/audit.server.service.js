'use strict';

let path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	logger = deps.logger,
	auditLogger = deps.auditLogger;

// Creates an audit entry persisted to Mongo and the bunyan logger
module.exports.audit = function(message, eventType, eventAction, eventActor, eventObject, eventMetadata) {
	let Audit = dbs.admin.model('Audit');
	let utilService = deps.utilService;

	// Extract additional metadata to audit
	let interfaceUrl = utilService.getHeaderField(eventMetadata, 'interface-url');
	if (interfaceUrl != null) {
		interfaceUrl = decodeURI(interfaceUrl);
	}
	let userAgentObj = utilService.getUserAgentFromHeader(eventMetadata);

	// Send to Mongo
	let newAudit = new Audit({
		created: Date.now(),
		message: message,
		audit: {
			auditType: eventType,
			action: eventAction,
			actor: eventActor,
			interfaceUrl: interfaceUrl,
			object: eventObject,
			userSpec: userAgentObj
		}
	});

	// Send to bunyan logger for logfile persistence
	auditLogger.audit(message, eventType, eventAction, eventActor, eventObject);

	return newAudit
		.save()
		.then(
			(result) => {
				return q(result);
			},
			(err) => {
				// Log and continue the error
				logger.error({err: err, audit: newAudit}, 'Error trying to persist audit record to storage.');
				return q.reject(err);
			});
};
