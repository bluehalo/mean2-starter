import {
	Component
} from '@angular/core';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { HelpTopic } from '../model/help.classes';
import { ConfigService } from '../../core/services/config.client.service';
import { User } from '../../admin/model/user.client.class';
import { AuthenticationService } from '../../admin/services/authentication.client.service';
import { HelpService } from '../help.service';

/**
 * Component that contains information about the application
 */
@Component({
	templateUrl: '../views/about.client.view.html'
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

@Component({
	templateUrl: '../views/help.client.view.html'
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

				this.router.navigate([`/help/${this.helpService.getTopics()[0].id}`]);
			});

		// If local mode and user has no roles, redirect
		if (!this.pki && !this.user.isActive()) {
			this.router.navigate(['/inactive-user']);
		}
	}

}
