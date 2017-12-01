import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthenticationService } from './authentication.service';
import { User } from '../user.class';
import { UserStateService } from './user-state.service';
import { ConfigService } from '../../core/config.service';

@Component({
	templateUrl: 'signin.component.html'
})
export class SigninComponent {

	user: User;

	error: string;

	isProxyPki: boolean = false;

	constructor(
		private authService: AuthenticationService,
		private userStateService: UserStateService,
		private configService: ConfigService
	) {
		configService.getConfig().first().subscribe((config: any) => this.isProxyPki = config.auth === 'proxy-pki');
	}

	ngOnInit() {
		this.user = this.authService.getCurrentUser();
	}

	signin() {
		this.authService.signin(this.user).subscribe(() => {
			if (this.userStateService.isAuthenticated()) {
				this.userStateService.goToRedirectRoute();
			}
		}, (error: HttpErrorResponse) => this.error = error.error.message);
	}
}
