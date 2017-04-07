import { Component } from '@angular/core';

import { ConfigService } from 'app/core';
import { User } from '../user';

import { AuthenticationService } from './authentication.service';
import { UserStateService } from './user-state.service';

@Component({
	templateUrl: './signin.component.html'
})
export class SigninComponent {
	error: string;
	config: any;
	user: User;

	constructor(
		private authService: AuthenticationService,
		private userStateService: UserStateService,
		private configService: ConfigService
	) {}

	ngOnInit() {
		this.user = this.authService.getCurrentUser();
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.config = config;
				if (config.auth === 'proxy-pki') {
					this.signin();
				}
			});
	}

	signin() {
		this.authService.signin(this.user)
			.subscribe(
				() => {
					if (this.userStateService.isAuthenticated()) {
						this.userStateService.goToRedirectRoute();
					}
				},
				(err) => this.error = JSON.parse(err._body).message
			);
	}

}
