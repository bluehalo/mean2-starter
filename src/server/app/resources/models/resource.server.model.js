'use strict';

let _ = require('lodash'),
	mongoose = require('mongoose'),
	extend = require('mongoose-schema-extend'),
	path = require('path'),
	uuid = require('node-uuid'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	schemaService = deps.schemaService,
	GetterSchema = schemaService.GetterSchema;

/**
 * Owner Schema
 */

let OwnerSchema = new GetterSchema({
	type: {
		type: String,
		default: 'team',
		enum: ['team', 'user', 'system'],
		required: 'Owner type is required'
	},
	_id: {
		type: mongoose.Schema.ObjectId,
		required: 'Owner ID is required'
	},
	name: {
		type: String,
		trim: true
	}
});

/**
 * Resource Schema
 */
module.exports.resourceOptions = {discriminatorKey: 'resourceType'};

let ResourceSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4
	},
	title: {
		type: String,
		trim: true,
		required: 'Title is required'
	},
	title_lowercase: {
		type: String,
		set: util.toLowerCase
	},
	description: {
		type: String,
		trim: true,
		default: ''
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
	tags: [{
		type: mongoose.Schema.ObjectId,
		ref: 'Tag',
		trim: true,
		default: []
	}],
	creator: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},
	owner: {
		type: OwnerSchema,
		required: 'Owner is required'
	}
}, module.exports.resourceOptions);

/*****************
 * Plugins
 *****************/

ResourceSchema.plugin(schemaService.countSearchable);

/*****************
 * Index declarations
 *****************/

ResourceSchema.index({ created: 1, updated: -1 });
ResourceSchema.index({ title_lowercase: 'text', description: 'text' });


/*****************
 * Lifecycle hooks
 *****************/

ResourceSchema.pre('save', function(next){
	this.title_lowercase = this.title;
	next();
});

/*****************
 * Instance Methods
 *****************/

/**
 * Remove a given tag from a resource
 * @param tagId
 */
ResourceSchema.methods.removeTag = function(tagId) {
	return this.update({$pull: {tags: tagId}, updated: Date.now()}).exec();
};


/*****************
 * Static Methods
 *****************/

// Create a filtered copy for auditing
ResourceSchema.statics.auditCopy = function(src) {
	let toReturn = {};
	src = src || {};

	toReturn._id = src._id;
	toReturn.creator = src.creator;
	toReturn.title = src.title;
	toReturn.description = src.description;
	toReturn.owner = _.cloneDeep(src.owner);
	if (_.isArray(src.tags)) {
		toReturn.tags = src.tags.map((t) => _.pick(t, ['_id']));
	}

	return toReturn;
};

ResourceSchema.statics.auditUpdateCopy = function(src) {
	let toReturn = {};
	src = src || {};

	toReturn._id = src._id;
	toReturn.title = src.title;
	toReturn.description = src.description;
	toReturn.owner = _.pick(src.owner, ['_id', 'type']);
	if (_.isArray(src.tags)) {
		toReturn.tags = src.tags.map((t) => _.pick(t, ['_id']));
	}

	return toReturn;
};


/**
 * Model Registration
 */

mongoose.model('Owner', OwnerSchema);
mongoose.model('Resource', ResourceSchema, 'resources');
