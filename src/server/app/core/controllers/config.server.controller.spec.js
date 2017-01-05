var should = require('should');

describe('Config Server Controller', function() {

	var configController = require('./config.server.controller');

	describe('#getSystemConfig', function() {

		it('should not include the mailer configuration', function() {
			var systemConfig = configController.getSystemConfig();
			systemConfig.should.not.have.property('mailer');
		});

		it('should only include a contact email address', function() {
			var systemConfig = configController.getSystemConfig();
			systemConfig.should.have.property('contactEmail');
			systemConfig.contactEmail.should.be.a.String();
		});
	});
});
