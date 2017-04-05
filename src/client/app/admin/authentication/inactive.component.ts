import { Component } from '@angular/core';

import { User } from '../user';

import { AuthenticationService } from './authentication.service';

@Component({
	templateUrl: './inactive.component.html',
	providers: [ User ]
})
export class InactiveComponent {
	constructor(
		private auth: AuthenticationService,
		private user: User
	) {
	}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();
	}
}
