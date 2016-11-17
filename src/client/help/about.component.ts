import { Component } from '@angular/core';

import { ConfigService } from '../core/config.service';

/**
 * Component that contains information about the application
 */
@Component({
	templateUrl: './about.component.html'
})
export class AboutComponent {

	private version: string = '';

	constructor(private configService: ConfigService) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.version = config.version;
			});
	}
}
