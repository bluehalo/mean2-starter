import { Component } from '@angular/core';

import { AuthenticationService } from '../authentication/authentication.service';
import { UserStateService } from '../authentication/user-state.service';
import { AlertService } from '../../shared/alert.service';

@Component({
	templateUrl: './user-eua.component.html'
})

export class UserEuaComponent {
	agree: boolean = false;

	eua: any;

	constructor(
		public authService: AuthenticationService,
		public alertService: AlertService,
		public userStateService: UserStateService) {}

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
