import { Component } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { User } from './user.class';
import { UserStateService } from './user-state.service';
import { ConfigService } from '../core/config.service';

@Component({
	templateUrl: './signin.component.html'
})
export class SigninComponent {
	private user: User;
	private error: string;
	private config: any;

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
