import { Component } from '@angular/core';
import { ConfigService } from '../core/config.service';

@Component({
	selector: 'external-links',
	templateUrl: './external-links.component.html'
})
export class ExternalLinksComponent {
	config: any;
	externalLinksEnabled: boolean;
	links: any;

	constructor(public configService: ConfigService) {
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
