'use strict';

let
	mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Project Schema
 */

let ProjectSchema = new GetterSchema({
	name: {
		type: String,
		trim: true,
		default: '',
		validate: [util.validateNonEmpty, 'Please provide a project name']
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


/**
 * Index declarations
 */

// Text-search index
ProjectSchema.index({ name: 'text', description: 'text' });

/**
 * Lifecycle Hooks
 */


/**
 * Instance Methods
 */


/**
 * Static Methods
 */


// Search projects by text and other criteria
ProjectSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

// Copy Project for creation
ProjectSchema.statics.createCopy = function(project) {
	let toReturn = {};

	toReturn.name = project.name;
	toReturn.description = project.description;
	toReturn.created = project.created;

	return toReturn;
};

// Copy a project for audit logging
ProjectSchema.statics.auditCopy = function(project) {
	let toReturn = {};
	project = project || {};

	toReturn._id = project._id;
	toReturn.name = project.name;
	toReturn.description = project.description;

	return toReturn;
};


/**
 * Model Registration
 */
mongoose.model('Project', ProjectSchema, 'projects');
