import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HelpTopic } from './help.class';
import { ConfigService } from '../core/config.service';
import { User } from '../admin/user.class';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { HelpService } from './help.service';

@Component({
	templateUrl: './help.component.html'
})

export class HelpComponent {

	private helpTopics: HelpTopic[] = [];

	private config: any = {};

	private user: User;

	private pki: boolean;

	constructor(
		private router: Router,
		private auth: AuthenticationService,
		private configService: ConfigService,
		private helpService: HelpService) {}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();

		this.configService.getConfig()
			.subscribe((config: any) => {
				this.helpTopics = this.helpService.helpRegistry;
				this.pki = config.auth === 'proxy-pki';
				this.config = config;
			});

		// If local mode and user has no roles, redirect
		if (!this.pki && !this.user.isActive()) {
			this.router.navigate(['/inactive-user']);
		}
	}

}
