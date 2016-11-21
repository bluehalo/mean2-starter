import {AsyUrlHandler} from './asy-url-handler.service';

export interface IUrlHandler {
	handleUrl(url: string): any;
}

export class UrlHandlerMapping {
	public static map = {
		'default': new AsyUrlHandler()
	};
}

export {AsyUrlHandler} from './asy-url-handler.service';
