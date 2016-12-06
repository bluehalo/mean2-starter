'use strict';

var	mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,

	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Message Schema
 */

var MessageSchema = new GetterSchema({
	title: {
		type: String,
		trim: true,
		required: 'Title is required'
	},
	tearline: {
		type: String,
		trim: true
	},
	type: {
		type: String,
		enum: ['MOTD', 'INFO', 'WARN', 'ERROR'],
		default: null
	},
	body: {
		type: String,
		trim: true,
		required: 'Message is required'
	},

	updated: {
		type: Date,
		get: util.dateParse
	},
	created: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	creator: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	}
});

/**
 * Index declarations
 */
// Text-search index
MessageSchema.index({ title: 'text', tearline: 'text', type: 'text' });

/**
 * Lifecycle Hooks
 */

/**
 * Instance Methods
 */

/**
 * Static Methods
 */
// Create a filtered deck for auditing
MessageSchema.statics.auditCopy = function(src) {
	var newMessage = {};
	src = src || {};

	newMessage.type = src.type;
	newMessage.title = src.title;
	newMessage.tearline = src.tearline;
	newMessage.body = src.body;
	newMessage.created = src.created;
	newMessage.updated  = src.updated;
	newMessage._id = src._id;

	return newMessage;
};

// Full Copy of a User (admin)
MessageSchema.statics.fullCopy = function(src) {
	var newMessage = {};
	src = src || {};

	newMessage.type = src.type;
	newMessage.title = src.title;
	newMessage.tearline = src.tearline;
	newMessage.body = src.body;
	newMessage.created = src.created;
	newMessage.updated  = src.updated;
	newMessage._id = src._id;

	return newMessage;
};

//Search users by text and other criteria
MessageSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

/**
 * Model Registration
 */
mongoose.model('Message', MessageSchema);
