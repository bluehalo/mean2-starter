var should = require('should');

describe('Config Server Controller', function() {

	var configController = require('./config.server.controller');

	describe('#getSystemConfig', function() {
		it('should only include the admin email address for the mailer configuration', function() {
			var systemConfig = configController.getSystemConfig();

			var clientSideMailerConfig = systemConfig.mailer;
			clientSideMailerConfig.should.have.properties('admin');
			clientSideMailerConfig.admin.should.be.a.String();

			delete clientSideMailerConfig.admin;

			clientSideMailerConfig.should.be.empty();
		});
	});
});
