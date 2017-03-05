import { Component, Input } from '@angular/core';

import * as _ from 'lodash';

import { AsyDropdownService } from './asy-dropdown.service';

@Component({
	selector: 'asy-dropdown',
	templateUrl: './asy-dropdown.component.html'
})

export class AsyDropdownComponent {

	@Input() value: string;

	@Input() options: any = {};

	@Input() mode: string;

	menuItems: any[] = [];

	valueToDisplay: string;

	constructor(
		public asyDropdownService: AsyDropdownService
	) {}

	ngOnInit() {
		// Save the mode
		this.options.mode = this.mode;

		// Default to value if no specific display version specified.
		this.valueToDisplay = this.options.valueToDisplay || this.value;
	}

	initializeMenu() {
		if (_.isEmpty(this.menuItems)) {
			this.menuItems = this.asyDropdownService.getMenuForMode(this.mode);
		}
	}
}
