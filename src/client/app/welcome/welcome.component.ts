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
	private config: any;
	private externalLinksEnabled: boolean;
	private messages: Message[];

	constructor(
		private auth: AuthenticationService,
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

		this.messages = [];

		this.messageService.markAllRead();
	}
}
