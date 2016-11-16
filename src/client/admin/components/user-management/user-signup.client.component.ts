import { Router } from '@angular/router';
import { Component } from '@angular/core';

import { ManageUserComponent } from './manage-user.client.component';
import { ConfigService } from '../../../core/services/config.client.service';
import { AlertService } from '../../../shared/services/alert.client.service';
import { AuthenticationService } from '../../services/authentication.client.service';
import { User } from '../../model/user.client.class';

@Component({
	selector: 'user-signup',
	templateUrl: '../../views/manage-user.client.view.html'
})
export class UserSignupComponent extends ManageUserComponent {

	private mode = 'signup';

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
