'use strict';

var
	mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * User Schema
 */
var UserAgreementSchema = new GetterSchema({
	title: {
		type: String,
		trim: true,
		default: '',
		validate: [util.validateNonEmpty, 'Please provide a title']
	},
	text: {
		type: String,
		trim: true,
		default: '',
		validate: [util.validateNonEmpty, 'Please provide text']
	},
	published: {
		type: Date,
		get: util.dateParse
	},
	updated: {
		type: Date,
		get: util.dateParse
	},
	created: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	}
});


/**
 * Index declarations
 */
UserAgreementSchema.index({ title: 'text', text: 'text' });


/**
 * Lifecycle Hooks
 */



/**
 * Instance Methods
 */


/**
 * Static Methods
 */

//Search euas by text and other criteria
UserAgreementSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

//Get the most recent eua
var getCurrentEua = function() {
	var defer = q.defer();

	this.findOne({ 'published': { '$ne': null, '$exists': true } })
		.sort({ 'published': -1 })
		.exec(function(err, eua) {
			if (err) {
				defer.reject(err);
			}
			defer.resolve(eua);
		});

	return defer.promise;
};
UserAgreementSchema.statics.getCurrentEua = getCurrentEua;


//Copy a user for audit logging
UserAgreementSchema.statics.auditCopy = function(eua) {
	var newEua = {};
	eua = eua || {};

	newEua._id = eua._id;
	newEua.title = eua.title;
	newEua.text = eua.text;
	newEua.published = eua.published;
	newEua.created = eua.created;
	newEua.updated = eua.updated;

	return newEua;
};

/**
 * Model Registration
 */
mongoose.model('UserAgreement', UserAgreementSchema);
