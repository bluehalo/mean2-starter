import { ClientConfiguration } from './configurator';
import { UrlClickHandler } from 'app/shared/urlHandler/url-click-handler.component';


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
