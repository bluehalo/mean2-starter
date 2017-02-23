'use strict';

var
	mongoose = require('mongoose'),
	path = require('path').posix,

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Schema Declaration
 */
var CacheEntrySchema = new GetterSchema({
	// The external id of this entry
	key: {
		type: String,
		trim: true
	},

	// The actual ts this entry was entered into the cache
	ts: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},

	// The value of the entry
	value: {},

	// The value of the entry, in string format
	valueString: {
		type: String
	}
});



/**
 * Index declarations
 */

CacheEntrySchema.index({ ts: -1 });
CacheEntrySchema.index({ key: 1 });

/*****************
 * Lifecycle hooks
 *****************/


/*****************
 * Static Methods
 *****************/

// Filtered Copy of a User (public)
CacheEntrySchema.statics.fullCopy = function(entry) {
	var toReturn = null;

	if(null != entry){
		toReturn = {};

		toReturn._id = entry._id;
		toReturn.key = entry.key;
		toReturn.ts = entry.ts;
		toReturn.value = entry.value;
	}

	return toReturn;
};

//Search entries by text and other criteria
CacheEntrySchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

// Find entries using a contains/wildcard regex on a fixed set of fields
CacheEntrySchema.statics.containsQuery = function(queryTerms, fields, search, limit, offset, sortArr) {
	return query.containsQuery(this, queryTerms, fields, search, limit, offset, sortArr);
};

/**
 * Register the Schema with Mongoose
 */
mongoose.model('CacheEntry', CacheEntrySchema, 'cache.entry');
