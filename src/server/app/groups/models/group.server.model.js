'use strict';

var
	mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Group Schema
 */
var GroupSchema = new GetterSchema({
	title: {
		type: String,
		trim: true,
		default: '',
		validate: [util.validateNonEmpty, 'Please provide a title']
	},
	title_lowercase: {
		type: String,
		set: util.toLowerCase
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
	creator: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},
	creatorName: {
		type: String
	},
	requiresExternalGroups: {
		type: [],
		default: []
	}
});


/**
 * Index declarations
 */

// Text-search index
GroupSchema.index({ title: 'text', description: 'text' });

/**
 * Lifecycle Hooks
 */

/**
 * Before saving:
 * 1. set the title_lowercase field to the title and let the Mongoose schema definition set it to lowercase
 */
GroupSchema.pre('save', function(next){
	this.title_lowercase = this.title;

	next();
});


/**
 * Instance Methods
 */


/**
 * Static Methods
 */


//Search groups by text and other criteria
GroupSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr, runCount) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr, runCount);
};


// Copy Group for creation
GroupSchema.statics.createCopy = function(group) {
	var toReturn = {};

	toReturn.title = group.title;
	toReturn.description = group.description;
	toReturn.created = group.created;

	return toReturn;
};

// Copy a group for audit logging
GroupSchema.statics.auditCopy = function(group) {
	var toReturn = {};
	group = group || {};

	toReturn._id = group._id;
	toReturn.title = group.title;
	toReturn.description = group.description;

	return toReturn;
};

// Copy a groupPermission for audit logging
GroupSchema.statics.auditCopyGroupPermission = function(group, user, role) {
	var toReturn = {};
	user = user || {};
	group = group || {};

	toReturn.user = {
		_id: user._id,
		name: user.name,
		username: user.username
	};

	toReturn.group = {
		_id: group._id,
		title: group.title
	};

	toReturn.role = role;

	return toReturn;
};

/**
 * Model Registration
 */
mongoose.model('Group', GroupSchema, 'groups');
