import { Component } from '@angular/core';

import { AlertService } from 'app/shared';
import { AuthenticationService, UserStateService } from '../authentication';

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
