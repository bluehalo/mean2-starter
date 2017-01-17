'use strict';

let
	mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Justification Schema
 */

let JustificationSchema = new GetterSchema({
	text: {
		type: String,
		trim: true,
		validate: [util.validateNonEmpty, 'Justification cannot be empty']
	},
	created: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	updated: {
		type: Date,
		default: Date.now,
		expires: '180d',
		get: util.dateParse
	},
	owner: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'Owner is required'
	}
});

/**
 * Index declarations
 */

JustificationSchema.index({owner: 1, text: 'text'});
JustificationSchema.index({owner: 1, updated: -1});

/**
 * Static Methods
 */

// Search justifications by text and other criteria
JustificationSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

/**
 * Model Registration
 */
mongoose.model('Justification', JustificationSchema, 'justifications');