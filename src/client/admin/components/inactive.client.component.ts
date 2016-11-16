import { Component } from '@angular/core';
import { User } from '../model/user.client.class';
import { AuthenticationService } from '../services/authentication.client.service';

@Component({
	templateUrl: '../views/inactive.client.view.html'
})

export class InactiveComponent {
	user: User;

	constructor(
		private auth: AuthenticationService
	) {
	}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();
	}
}
