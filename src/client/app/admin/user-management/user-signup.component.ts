import { Router } from '@angular/router';
import { Component } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { ManageUserComponent } from './manage-user.component';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { User } from '../user.class';

@Component({
	selector: 'user-signup',
	templateUrl: 'manage-user.component.html'
})
export class UserSignupComponent extends ManageUserComponent {

	mode = 'signup';

	constructor(
		private authService: AuthenticationService,
		protected router: Router,
		protected configService: ConfigService,
		public alertService: AlertService
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

	submitUser(user: User): Observable<any> {
		return this.authService.signup(user);
	}

}
