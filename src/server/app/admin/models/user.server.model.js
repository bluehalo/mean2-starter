'use strict';

let _ = require('lodash'),
	crypto = require('crypto'),
	mongoose = require('mongoose'),
	path = require('path'),
	uniqueValidator = require('mongoose-unique-validator'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	util = deps.utilService,
	query = deps.queryService,
	schemaService = deps.schemaService,
	userAuthorizationService = require(path.resolve('./src/server/app/admin/services/users.authorization.server.service.js')),
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Validation
 */

// Validate the password
let validatePassword = function(password) {
	let toReturn = true;

	// only care if it's local
	if(this.provider === 'local') {
		toReturn = (null != password) && password.length >= 6;
	}

	return toReturn;
};
let passwordMessage = 'Password must be at least 6 characters long';

/**
 * User Schema
 */

let UserSchema = new GetterSchema({
	name: {
		type: String,
		trim: true,
		required: 'Name is required'
	},
	organization: {
		type: String,
		trim: true,
		required: 'Organization is required'
	},
	email: {
		type: String,
		trim: true,
		required: 'Email is required',
		match: [util.emailMatcher, 'A valid email address is required']
	},
	phone: {
		type: String,
		trim: true,
		default: '',
		match: [/.+\@.+\..+/, 'A valid phone number and cellular provider is required'],
		required: false
	},
	username: {
		type: String,
		unique: 'This username is already taken',
		required: 'Username is required',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validatePassword, passwordMessage]
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: {
			user: {
				type: Boolean,
				default: false
			},
			editor: {
				type: Boolean,
				default: false
			},
			auditor: {
				type: Boolean,
				default: false
			},
			admin: {
				type: Boolean,
				default: false
			}
		}
	},
	externalGroups: {
		type: [],
		default: []
	},
	externalRoles: {
		type: [],
		default: []
	},
	bypassAccessCheck: {
		type: Boolean,
		default: false
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
	messagesViewed: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date,
		get: util.dateParse
	},
	acceptedEua: {
		type: Date,
		default: null,
		get: util.dateParse
	},
	lastLogin: {
		type: Date,
		default: null,
		get: util.dateParse
	}
});

/*****************
 * Plugins
 *****************/

UserSchema.plugin(schemaService.pageable);
UserSchema.plugin(uniqueValidator);

/**
 * Index declarations
 */

// Text-search index
UserSchema.index({ name: 'text', email: 'text', username: 'text' });


/**
 * Lifecycle Hooks
 */

// Process the password
UserSchema.pre('save', function(next) {
	let user = this;

	// If the password is modified and it is valid, then re- salt/hash it
	if (user.isModified('password') && validatePassword.call(user, user.password)) {
		user.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		user.password = user.hashPassword(user.password);
	}

	// Remember whether the document was new, for the post-save hook
	this.wasNew = this.isNew;

	next();
});

/**
 * Instance Methods
 */

// Hash Password
UserSchema.methods.hashPassword = function(password) {
	let user = this;

	if (user.salt && password) {
		return crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'SHA1').toString('base64');
	} else {
		return password;
	}
};

// Authenticate a password against the user
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Static Methods
 */

UserSchema.statics.hasRoles = function(user, roles){
	if (null == user.roles) {
		return false;
	}
	let toReturn = true;

	if (null != roles) {
		roles.forEach(function(element) {
			if (!user.roles[element]) {
				toReturn = false;
			}
		});
	}

	return toReturn;
};

//Search users by text and other criteria
UserSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

// Find users using a contains/wildcard regex on a fixed set of fields
UserSchema.statics.containsQuery = function(queryTerms, fields, search, limit, offset, sortArr) {
	return query.containsQuery(this, queryTerms, fields, search, limit, offset, sortArr);
};

// Filtered Copy of a User (public)
UserSchema.statics.filteredCopy = function(user) {
	let toReturn = null;

	if(null != user){
		toReturn = {};

		toReturn._id = user._id;
		toReturn.name = user.name;
		toReturn.username = user.username;
		toReturn.created = user.created;
		toReturn.lastLogin = user.lastLogin;
		toReturn.messagesViewed = user.messagesViewed;
	}

	return toReturn;
};


// Full Copy of a User (admin)
UserSchema.statics.fullCopy = function(user) {
	let toReturn = null;

	if(null != user){
		toReturn = user.toObject();
		if (toReturn.hasOwnProperty('password')) {
			delete toReturn.password;
		}
	}

	return toReturn;
};

// Copy User for creation
UserSchema.statics.createCopy = function(user) {
	let toReturn = {};

	toReturn.name = user.name;
	toReturn.organization = user.organization;
	toReturn.email = user.email;
	toReturn.phone = user.phone;
	toReturn.username = user.username;
	toReturn.password = user.password;
	toReturn.created = Date.now();
	toReturn.updated = toReturn.created;
	toReturn.messagesViewed = user.messagesViewed;

	return toReturn;
};

// Copy a user for audit logging
UserSchema.statics.auditCopy = function(user, userIP) {
	let toReturn = {};
	user = user || {};

	toReturn._id = user._id;
	toReturn.name = user.name;
	toReturn.username = user.username;
	toReturn.organization = user.organization;
	toReturn.email = user.email;
	toReturn.phone = user.phone;
	toReturn.messagesViewed = user.messagesViewed;
	if (null != userIP) {
		toReturn.ip = userIP;
	}

	toReturn.roles = _.cloneDeep(user.roles);
	toReturn.bypassAccessCheck = user.bypassAccessCheck;
	toReturn.externalRoleAccess = userAuthorizationService.checkExternalRoles(user, config.auth);
	if (null != user.providerData && null != user.providerData.dn) {
		toReturn.dn = user.providerData.dn;
	}

	return toReturn;
};

/**
 * Model Registration
 */
mongoose.model('User', UserSchema);
