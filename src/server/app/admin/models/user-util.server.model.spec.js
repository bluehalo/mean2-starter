'use strict';

const path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,

	User = dbs.admin.model('User');

const userSpec = (key) => {
	return {
		name: key + ' Name',
		organization: key + ' Organization',
		email: key + '@mail.com',
		username: key + '_username',
		password: 'password',
		provider: 'local'
	};
};

const clearUsers = () => {
	return User.remove();
};

const create = (key) => {
	return new User(userSpec(key)).save();
};

module.exports = {
	clearUsers: clearUsers,
	create: create,
	userSpec: userSpec
};
