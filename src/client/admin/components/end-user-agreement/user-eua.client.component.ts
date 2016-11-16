import { Component } from '@angular/core';

import { AuthenticationService } from './../../services/authentication.client.service';
import { UserStateService } from '../../services/user-state.client.service';
import { AlertService } from '../../../shared/services/alert.client.service';

@Component({
	templateUrl: '../../views/eua/user-eua.client.view.html'
})

export class UserEuaComponent {
	private agree: boolean = false;

	private eua: any;

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

	private accept() {
		this.authService.acceptEua()
			.subscribe(() => {
				console.log('Accepted EUA for user.');
				this.userStateService.goToRedirectRoute();
			},
			(error: any) => {
				this.alertService.addAlert(error.message);
				console.error('Error persisting EUA accept');
			});
	};
}
