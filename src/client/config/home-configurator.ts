import { ClientConfiguration } from './configurator';
import { BaseService2 } from './test/test-stub-service.client.service';

let config = ClientConfiguration.config;

ClientConfiguration.applyConfig({
	providers: {
		BaseService: {
			useClass: BaseService2
		}
	}
});

// Complete the initialization
ClientConfiguration.completeInitialization();
