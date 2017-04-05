import { Component } from '@angular/core';

import { User } from '../user';

@Component({
	templateUrl: './unauthorized.component.html',
	providers: [ User ]
})
export class UnauthorizedComponent {
	constructor(
		private user: User
	) {
	}
}
