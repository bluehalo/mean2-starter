import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthenticationService } from '../authentication/authentication.service';
import { UserStateService } from '../authentication/user-state.service';
import { AlertService } from '../../shared/alert.service';

@Component({
	templateUrl: 'user-eua.component.html'
})
export class UserEuaComponent {

	agree: boolean = false;

	eua: any;

	constructor(
		private authService: AuthenticationService,
		private userStateService: UserStateService,
		public alertService: AlertService
	) {}

	ngOnInit() {
		this.alertService.clearAllAlerts();
		this.authService.getCurrentEua().subscribe( (eua: any) => this.eua = eua);
	}

	accept() {
		this.authService.acceptEua().subscribe(() => {
			this.userStateService.goToRedirectRoute();
		}, (error: HttpErrorResponse) => {
			this.alertService.addAlert(error.error.message);
		});
	}
}
