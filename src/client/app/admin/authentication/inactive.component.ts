import { Component } from '@angular/core';

import { User } from '../user';

import { AuthenticationService } from './authentication.service';

@Component({
	templateUrl: './inactive.component.html'
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
