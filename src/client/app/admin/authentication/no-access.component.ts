import { Component } from '@angular/core';

import { User } from '../user';

import { AuthenticationService } from './authentication.service';

@Component({
	templateUrl: './no-access.component.html'
})
export class NoAccessComponent {
	user: User;

	constructor(
		private auth: AuthenticationService
	) {
	}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();
	}
}
