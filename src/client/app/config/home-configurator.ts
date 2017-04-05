import { ClientConfiguration } from './configurator';
import { UrlClickHandler } from 'app/shared';


ClientConfiguration.applyConfig({
	providers: {
		BaseService: { }
	},
	components: {
		urlHandler: {
			useClass: UrlClickHandler
		}
	}
});

// Complete the initialization
ClientConfiguration.completeInitialization();
