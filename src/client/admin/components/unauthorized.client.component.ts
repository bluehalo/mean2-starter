import {Component} from '@angular/core';
import {User} from '../model/user.client.class';

@Component({
	templateUrl: '../views/unauthorized.client.view.html'
})

export class UnauthorizedComponent {
	user: User;

	constructor(
	) {

	}
}
