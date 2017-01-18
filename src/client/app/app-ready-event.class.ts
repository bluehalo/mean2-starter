import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Injectable()
export class AppReadyEvent {

	private doc: Document;

	private isAppReady: boolean;

	constructor(
		@Inject(DOCUMENT) doc: any
	) {
		this.doc = doc;
		this.isAppReady = false;
	}

	trigger(): void {
		if (this.isAppReady) {
			return;
		}

		let bubbles: boolean = true;
		let cancelable: boolean = false;

		this.doc.dispatchEvent(this.createEvent('appready', bubbles, cancelable));
		this.isAppReady = true;
	}

	private createEvent(eventType: string, bubbles: boolean, cancelable: boolean): Event {
		let customEvent: any;

		// Try/catch for handling IE which uses a different type of event initialization. Try
		// the 'normal' event generation first, then fallback to use IE version.
		try {
			customEvent = new CustomEvent(eventType, {bubbles: bubbles, cancelable: cancelable});
		}
		catch (error) {
			customEvent = this.doc.createEvent('CustomEvent');
			customEvent.initCustomEvent(eventType, bubbles, cancelable, null);
		}

		return customEvent;
	}
}
