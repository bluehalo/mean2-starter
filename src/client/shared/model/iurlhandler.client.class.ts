import {AsyUrlHandler} from '../services/url-handlers/asy-url-handler.client.service';

export interface IUrlHandler {
	handleUrl(url: string): any;
}

export class UrlHandlerMapping {
	public static map = {
		'default': new AsyUrlHandler()
	};
}

export {AsyUrlHandler} from '../services/url-handlers/asy-url-handler.client.service';
