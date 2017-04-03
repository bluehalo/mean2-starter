import { Component } from '@angular/core';

import { User } from '../user';

@Component({
	templateUrl: './unauthorized.component.html'
})
export class UnauthorizedComponent {
	user: User;
}
