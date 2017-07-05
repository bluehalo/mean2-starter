import { Component } from '@angular/core';

import { ConfigService } from 'app/core';

@Component({
	selector: 'external-links',
	templateUrl: './external-links.component.html'
})
export class ExternalLinksComponent {

	links: any;

	private config: any;
	private externalLinksEnabled: boolean;

	constructor(private configService: ConfigService) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.config = config;

				this.externalLinksEnabled = config.welcomeLinks && config.welcomeLinks.enabled;
				this.links = config.welcomeLinks.links;
			});
	}

	handleLinkClick(evt: any) {
		evt.stopPropagation();
	}

}
