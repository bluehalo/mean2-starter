import { Component } from '@angular/core';

import { User } from '../user';

import { AuthenticationService } from './authentication.service';

@Component({
	templateUrl: './no-access.component.html',
	providers: [ User ]
})
export class NoAccessComponent {
	constructor(
		private auth: AuthenticationService,
		private user: User
	) {
	}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();
	}
}
