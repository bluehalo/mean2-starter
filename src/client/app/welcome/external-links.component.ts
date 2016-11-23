import { Component } from '@angular/core';
import { ConfigService } from '../core/config.service';

@Component({
	selector: 'external-links',
	templateUrl: './external-links.component.html'
})
export class ExternalLinksComponent {
	private config: any;
	private externalLinksEnabled: boolean;
	private links: any;

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

	private handleLinkClick(evt: any) {
		evt.stopPropagation();
	}

}
