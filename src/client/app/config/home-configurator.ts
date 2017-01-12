import { ClientConfiguration } from './configurator';
import { BaseService2 } from './test/test-stub-service.service';
import { UrlClickHandler } from '../shared/urlHandler/url-click-handler.component';

let config = ClientConfiguration.config;

ClientConfiguration.applyConfig({
	providers: {
		BaseService: {
			useClass: BaseService2
		}
	},
	components: {
		urlHandler: {
			useClass: UrlClickHandler
		}
	}
});

// Complete the initialization
ClientConfiguration.completeInitialization();
