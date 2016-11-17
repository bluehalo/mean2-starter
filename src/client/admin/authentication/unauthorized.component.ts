import { Component } from '@angular/core';

import { User } from './user.class';

@Component({
	templateUrl: './unauthorized.component.html'
})

export class UnauthorizedComponent {
	user: User;

	constructor(
	) {

	}
}
