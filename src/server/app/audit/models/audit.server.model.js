'use strict';

let mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,
	schemaService = deps.schemaService,
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Schema Declaration
 */
let AuditSchema = new GetterSchema({
	created: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	message: { type: String },
	audit: {
		type: {
			auditType: { type: String },
			action: { type: String },
			actor: { type: String },
			interfaceUrl: {type: String},
			object: { type: String },
			userSpec: {
				type: {
					browser: {type: String},
					os: {type: String}
				}
			}
		}
	}
});

/*****************
 * Plugins
 *****************/

AuditSchema.plugin(schemaService.pageable);

/**
 * Index declarations
 */

// Created datetime index
AuditSchema.index({ 'created': -1 });

// Audit Type index
AuditSchema.index({ 'audit.auditType': 'text' });

// User index
AuditSchema.index({ 'audit.actor': 'text' });

// Text-search index
AuditSchema.index({ 'message': 'text', 'audit.auditType': 'text', 'audit.action': 'text', 'audit.object': 'text' });

/*****************
 * Lifecycle hooks
 *****************/


/*****************
 * Static Methods
 *****************/

// Search audit events by text and other criteria
AuditSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

/**
 * Register the Schema with Mongoose
 */
mongoose.model('Audit', AuditSchema, 'audit');
