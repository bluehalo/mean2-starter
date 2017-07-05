import { Router } from '@angular/router';
import { Component } from '@angular/core';

import { ConfigService } from 'app/core';
import { AlertService } from 'app/shared';

import { AuthenticationService } from '../authentication';
import { ManageUserComponent } from './manage-user.component';
import { User } from '../user';

@Component({
	selector: 'user-signup',
	templateUrl: './manage-user.component.html'
})
export class UserSignupComponent extends ManageUserComponent {

	mode = 'signup';

	constructor(
		router: Router,
		configService: ConfigService,
		alertService: AlertService,
		private authService: AuthenticationService
	) {
		super(router, configService, alertService);
	}

	initialize() {
		this.title = 'New Account Request';
		this.subtitle = 'Provide the required information to request an account';
		this.okButtonText = 'Submit';
		this.navigateOnSuccess = '/signed-up';
		this.user = new User();
	}

	handleBypassAccessCheck() {
		// Don't need to do anything
	}

	submitUser(user: User) {
		return this.authService.signup(user);
	}

}
