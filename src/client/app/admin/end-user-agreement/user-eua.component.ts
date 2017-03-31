import { Component } from '@angular/core';

import { AuthenticationService } from '../authentication/authentication.service';
import { UserStateService } from '../authentication/user-state.service';
import { AlertService } from 'app/shared/alert.service';

@Component({
	templateUrl: './user-eua.component.html'
})

export class UserEuaComponent {

	agree: boolean = false;
	eua: any;

	constructor(
		private authService: AuthenticationService,
		private alertService: AlertService,
		private userStateService: UserStateService) {}

	ngOnInit() {
		this.alertService.clearAllAlerts();
		this.authService.getCurrentEua().subscribe( (eua: any) => {
			this.eua = eua;
		});

	}

	accept() {
		this.authService.acceptEua()
			.subscribe(() => {
				this.userStateService.goToRedirectRoute();
			},
			(error: any) => {
				this.alertService.addAlert(error.message);
			});
	};
}
