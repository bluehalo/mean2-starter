import { Component } from '@angular/core';

import { ConfigService } from '../core/config.service';

/**
 * Component that contains information about the application
 */
@Component({
	templateUrl: './about.component.html'
})
export class AboutComponent {

	version: string = '';

	adminEmail: string = '';

	instanceName: string = '';

	constructor(public configService: ConfigService) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.version = config.version;
				this.adminEmail = config.contactEmail;
				this.instanceName = config.app.instanceName;
			});
	}

	getMailToString() {
		return `mailto:${this.adminEmail}?Subject=${this.instanceName}%20Support`;
	}
}
