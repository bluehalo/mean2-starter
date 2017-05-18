'use strict';

let
	mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,
	schemaService = deps.schemaService,
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Tag Schema
 */

let TagSchema = new GetterSchema({
	name: {
		type: String,
		trim: true,
		default: '',
		validate: [util.validateNonEmpty, 'Please provide a tag name']
	},
	description: {
		type: String,
		trim: true
	},
	created: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	updated: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	owner: {
		type: mongoose.Schema.ObjectId,
		ref: 'Team'
	}
});

/*****************
 * Plugins
 *****************/

TagSchema.plugin(schemaService.pageable);

/**
 * Index declarations
 */

// Text-search index
TagSchema.index({ name: 'text', description: 'text' });

/**
 * Lifecycle Hooks
 */


/**
 * Instance Methods
 */


/**
 * Static Methods
 */


// Search tags by text and other criteria
TagSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

// Copy Tag for creation
TagSchema.statics.createCopy = function(tag) {
	let toReturn = {};

	toReturn.name = tag.name;
	toReturn.description = tag.description;
	toReturn.created = tag.created;

	return toReturn;
};

// Copy a tag for audit logging
TagSchema.statics.auditCopy = function(tag) {
	let toReturn = {};
	tag = tag || {};

	toReturn._id = tag._id;
	toReturn.name = tag.name;
	toReturn.description = tag.description;

	return toReturn;
};


/**
 * Model Registration
 */
mongoose.model('Tag', TagSchema, 'tags');
