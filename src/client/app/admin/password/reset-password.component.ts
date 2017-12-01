import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from '../authentication/authentication.service';
import { UserStateService } from '../authentication/user-state.service';
import { ConfigService } from '../../core/config.service';

@Component({
	templateUrl: 'reset-password.component.html'
})
export class ResetPasswordComponent {

	token: string;

	invalid: boolean = true;

	error: string;

	success: string;

	newPassword: string;

	verifyPassword: string;

	private routeParamSubscription: Subscription;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
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

		this.routeParamSubscription = this.route.params.subscribe((params: Params) => {
			this.token = params[`token`];
			this.validateToken();
		});
	}

	ngOnDestroy() {
		this.routeParamSubscription.unsubscribe();
	}

	validateToken() {
		if (null != this.token) {
			this.authService.validateToken(this.token).subscribe(
				() => this.invalid = false,
				() => this.invalid = true);
		}
	}

	resetPassword() {
		this.success = null;
		this.error = null;

		// Check the password
		let validatePassword = this.authService.validatePassword(this.newPassword, this.verifyPassword);
		if (!validatePassword.valid) {
			this.error = validatePassword.message;
			return;
		}

		this.authService.resetPassword(this.token, this.newPassword).subscribe(() => {
			this.newPassword = null;
			this.verifyPassword = null;

			this.router.navigate(['/password/reset-success']);
		}, (error: HttpErrorResponse) => {
			this.error = error.error.message;
		});
	}
}
