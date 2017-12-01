import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthenticationService } from '../authentication/authentication.service';
import { UserStateService } from '../authentication/user-state.service';
import { ConfigService } from '../../core/config.service';
import { User } from '../user.class';

@Component({
	templateUrl: 'forgot-password.component.html'
})
export class ForgotPasswordComponent {

	user: User;

	error: string;

	success: string;

	pending: string;

	username: string;

	constructor(
		private router: Router,
		private authService: AuthenticationService,
		private userStateService: UserStateService,
		private configService: ConfigService
	) {}

	ngOnInit() {
		// If user is signed in then redirect back home
		if (this.userStateService.isAuthenticated()) {
			this.router.navigate(['/']);
		}

		// If we aren't running in local mode, users shouldn't be able to change passwords
		this.configService.getConfig().first().filter((config: any) => config.auth === 'proxy-pki').subscribe((config: any) => this.router.navigate(['/']));
	}

	requestPasswordReset() {
		this.success = null;
		this.error = null;

		if (null == this.username) {
			this.error = 'Missing username.';
		}
		else {
			this.pending = 'Processing request...';
			this.authService.forgotPassword(this.username).subscribe((result: any) => {
				this.username = null;
				this.success = result;
				this.pending = null;
			}, (error: HttpErrorResponse) => {
				this.error = error.error.message;
				this.pending = null;
			});
		}
	}
}
