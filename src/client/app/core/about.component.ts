import { Component } from '@angular/core';

import { ConfigService } from './config.service';

/**
 * Component that contains information about the application
 */
@Component({
	templateUrl: 'about.component.html'
})
export class AboutComponent {

	version: string;

	adminEmail: string;

	instanceName: string;

	mailToString: string;

	constructor(private configService: ConfigService) {}

	ngOnInit() {
		this.configService.getConfig().first().subscribe((config: any) => {
			this.version = config.version;
			this.adminEmail = config.contactEmail;
			this.mailToString = `mailto:${this.adminEmail}?Subject=${config.app.instanceName}%20Support`;
		});
	}
}
