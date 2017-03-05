import { Component } from '@angular/core';

import { Message } from '../messages/message.class';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { ConfigService } from '../core/config.service';
import { AlertService } from '../shared/alert.service';
import { MessageService } from '../messages/message.service';

@Component({
	templateUrl: './welcome.component.html'
})
export class WelcomeComponent {
	config: any;
	externalLinksEnabled: boolean;
	messages: Message[];

	constructor(
		public auth: AuthenticationService,
		public configService: ConfigService,
		public alertService: AlertService,
		public messageService: MessageService) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.config = config;
				this.externalLinksEnabled = config.welcomeLinks && config.welcomeLinks.enabled;
			});

		this.alertService.clearAllAlerts();

		this.messages = [];

		this.messageService.markAllRead();
	}
}
