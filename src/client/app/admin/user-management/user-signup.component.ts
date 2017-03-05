import { Router } from '@angular/router';
import { Component } from '@angular/core';

import { ManageUserComponent } from './manage-user.component';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { User } from '../user.class';

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
		public authService: AuthenticationService
	) {
		super(router, configService, alertService);
	}

	initialize() {
		this.title = 'New Account Request';
		this.subtitle = 'Provide the required information to request an account';
		this.okButtonText = 'Submit';
		this.navigateOnSuccess = '';
		this.user = new User();
	}

	handleBypassAccessCheck() {
		// Don't need to do anything
	}

	submitUser(user: User) {
		return this.authService.signup(user);
	}

}
