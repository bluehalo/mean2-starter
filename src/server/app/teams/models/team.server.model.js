'use strict';

let
	mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	query = deps.queryService,
	GetterSchema = deps.schemaService.GetterSchema;

/**
 * Team Schema
 */

let TeamRoleSchema = new GetterSchema({
	_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Team'
	},
	role: {
		type: String,
		trim: true,
		default: 'member',
		enum: ['admin', 'editor', 'member']
	}
});

let TeamUserSchema = mongoose.model('User').schema.extend({
	teams: {
		type: [TeamRoleSchema],
		default: []
	}
});

let TeamSchema = new GetterSchema({
	name: {
		type: String,
		trim: true,
		default: '',
		validate: [util.validateNonEmpty, 'Please provide a team name']
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
	requiresExternalTeams: {
		type: [],
		default: []
	}
});


/**
 * Index declarations
 */

// Text-search index
TeamSchema.index({ name: 'text', description: 'text' });

/**
 * Lifecycle Hooks
 */

/**
 * Instance Methods
 */


/**
 * Static Methods
 */


// Search teams by text and other criteria
TeamSchema.statics.search = function(queryTerms, searchTerms, limit, offset, sortArr) {
	return query.search(this, queryTerms, searchTerms, limit, offset, sortArr);
};

// Copy Team for creation
TeamSchema.statics.createCopy = function(team) {
	let toReturn = {};

	toReturn.name = team.name;
	toReturn.description = team.description;
	toReturn.created = team.created;

	return toReturn;
};

// Copy a team for audit logging
TeamSchema.statics.auditCopy = function(team) {
	let toReturn = {};
	team = team || {};

	toReturn._id = team._id;
	toReturn.name = team.name;
	toReturn.description = team.description;

	return toReturn;
};

// Copy a team role for audit logging
TeamSchema.statics.auditCopyTeamMember = function(team, user, role) {
	let toReturn = {};
	user = user || {};
	team = team || {};

	toReturn.user = {
		_id: user._id,
		name: user.name,
		username: user.username
	};

	toReturn.team = {
		_id: team._id,
		name: team.name
	};

	toReturn.role = role;

	return toReturn;
};

// Team Copy of a User (has team roles for the team )
TeamUserSchema.statics.teamCopy = function(user, teamId) {
	let toReturn = null;

	if(null != user){
		toReturn = user.toObject();

		toReturn.teams = [];
		if(null != user.teams) {
			user.teams.forEach(function(element){
				if(null != element._id && element._id.equals(teamId)) {
					toReturn.teams.push(element);
				}
			});
		}
	}

	return toReturn;
};

/**
 * Model Registration
 */
mongoose.model('Team', TeamSchema, 'teams');
mongoose.model('TeamRole', TeamRoleSchema);
mongoose.model('TeamUser', TeamUserSchema, 'users');
