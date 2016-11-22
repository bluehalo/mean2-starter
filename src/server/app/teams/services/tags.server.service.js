'use strict';

let
	path = require('path'),
	q = require('q'),
	_ = require('lodash'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	auditService = deps.auditService,
	util = deps.utilService,
	Tag = dbs.admin.model('Tag'),
	Team = dbs.admin.model('Team'),
	TeamMember = dbs.admin.model('TeamUser');

module.exports = function() {

	/**
	 * Copies the mutable fields from src to dest
	 *
	 * @param dest
	 * @param src
	 */
	function copyTagMutableFields(dest, src) {
		dest.name = src.name;
		dest.description = src.description;
	}

	/**
	 * Creates a new tag with the requested metadata
	 *
	 * @param tagInfo
	 * @param creator The user requesting the create
	 * @returns {Promise} Returns a promise that resolves if tag is successfully created, and rejects otherwise
	 */
	function createTag(tagInfo, creator) {
		let teamId = tagInfo.owner.id || tagInfo.owner || null;

		// Create the new tag model
		let newTag = new Tag(tagInfo);

		// Write the auto-generated metadata
		newTag.created = Date.now();
		newTag.updated = Date.now();

		// Audit the creation action
		return auditService.audit('tag created', 'tag', 'create', TeamMember.auditCopy(creator), Tag.auditCopy(newTag))
			.then(function () {
				// Get the reference to owner
				return Team.findOne({_id: teamId}).exec();
			})
			.then(function (team) {
				if (null != team) {
					newTag.owner = team;
					return q(newTag);
				}
				return q.reject({status: 400, type: 'bad-request', message: 'Invalid team id.'});
			})
			.then(function(tag) {
				// Save the new tag
				return tag.save();
			});
	}

	/**
	 * Updates an existing tag with fresh metadata
	 *
	 * @param tag The tag object to update
	 * @param updatedTag
	 * @param user The user requesting the update
	 * @returns {Promise} Returns a promise that resolves if tag is successfully updated, and rejects otherwise
	 */
	function updateTag(tag, updatedTag, user) {
		// Make a copy of the original tag for a "before" snapshot
		let originalTag = Tag.auditCopy(tag);

		// Update the updated date
		tag.updated = Date.now();

		// Copy in the fields that can be changed by the user
		copyTagMutableFields(tag, updatedTag);

		// Audit the update action
		return auditService.audit('tag updated', 'tag', 'update', TeamMember.auditCopy(user), { before: originalTag, after: Tag.auditCopy(tag) })
			.then(function() {
				// Save the updated tag
				return tag.save();
			});
	}

	/**
	 * Deletes an existing tag
	 *
	 * @param tag The tag object to delete
	 * @param user The user requesting the delete
	 * @returns {Promise} Returns a promise that resolves if tag is successfully deleted, and rejects otherwise
	 */
	function deleteTag(tag, user) {
		// Audit the deletion attempt
		return auditService.audit('tag deleted', 'tag', 'delete', TeamMember.auditCopy(user), Tag.auditCopy(tag))
			.then(function() {
				// Delete the tag
				return tag.remove();
			});
	}

	function searchTags(search, query, queryParams, user) {
		let page = util.getPage(queryParams);
		let limit = util.getLimit(queryParams);

		let offset = page * limit;

		// Default to sorting by ID
		let sortArr = [{property: '_id', direction: 'DESC'}];
		if (null != queryParams.sort && null != queryParams.dir) {
			sortArr = [{property: queryParams.sort, direction: queryParams.dir}];
		}

		return q()
			.then(function() {
				// If user is not an admin, constrain the results to the user's teams
				if (null == user.roles || !user.roles.admin) {
					let userObj = user.toObject();
					let userTeams = [];

					if (null != userObj.teams && _.isArray(userObj.teams)) {
						// Get list of user's teams by id
						userTeams = userObj.teams.map((t) => t._id.toString());
					}

					// If the query already has a filter by team, take the intersection
					if (null != query.owner && null != query.owner.$in) {
						userTeams = userTeams.filter((t) => query.owner.$in.indexOf(t) > -1);
					}

					// If no remaining teams, return no results
					if (userTeams.length === 0) {
						return q();
					}
					else {
						query.owner = {
							$in: userTeams
						};
					}
				}

				return Tag.search(query, search, limit, offset, sortArr);
			})
			.then(function(result) {
				if (null == result) {
					return q({
						totalSize: 0,
						pageNumber: 0,
						pageSize: limit,
						totalPages: 0,
						elements: []
					});
				}
				else {
					return q({
						totalSize: result.count,
						pageNumber: page,
						pageSize: limit,
						totalPages: Math.ceil(result.count / limit),
						elements: result.results
					});
				}
			});
	}

	return {
		createTag: createTag,
		updateTag: updateTag,
		deleteTag: deleteTag,
		searchTags: searchTags
	};
};
