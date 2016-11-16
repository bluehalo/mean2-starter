import { Component, forwardRef, Inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.client.service';
import { User } from '../model/user.client.class';
import { UserStateService } from '../services/user-state.client.service';
import { ConfigService } from '../../core/services/config.client.service';
import { BaseService } from '../../config/test/test-stub-service.client.service';

@Component({
	templateUrl: '../views/signin.client.view.html'
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
