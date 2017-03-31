import { Component } from '@angular/core';

import { ConfigService } from 'app/core/config.service';
import { AlertService } from 'app/shared/alert.service';
import { MessageService } from 'app/messages/message.service';

@Component({
	templateUrl: './welcome.component.html'
})
export class WelcomeComponent {
	externalLinksEnabled: boolean;
	private config: any;

	constructor(
		private configService: ConfigService,
		private alertService: AlertService,
		private messageService: MessageService) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.config = config;
				this.externalLinksEnabled = config.welcomeLinks && config.welcomeLinks.enabled;
			});

		this.alertService.clearAllAlerts();
		this.messageService.markAllRead();
	}
}
