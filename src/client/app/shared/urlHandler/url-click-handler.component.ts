import { Component, Input } from '@angular/core';

import { AsyDropdownHandlers } from '../dropdown';

@Component({
	template: `<asy-dropdown-item (clicked)="retrieveUrl()" label="Retrieve URL"></asy-dropdown-item>`
})
export class UrlClickHandler {
	@Input() value: string;

	@Input() options: any = {};

	retrieveUrl() {
		window.open(this.value);
	}
}
AsyDropdownHandlers.registerHandler('url', 'default', UrlClickHandler);
AsyDropdownHandlers.registerHandler('image', 'default', UrlClickHandler);

