import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../user.class';

/**
 *
 */
@Injectable()
export class UserStateService {

	user: User = new User();

	authRedirectUrl: string; // Can maintain state of a url to redirect to after login

	constructor(private router: Router) {}

	/**
	 * Redirect the user to the last attempted route
	 */
	goToRedirectRoute() {
		// Check if we stored a redirect url.  This is set by the AuthGuard if a prior attempt
		// to navigate somewhere failed.  Send the user back where they were trying to go...
		let redirect = this.authRedirectUrl ? this.authRedirectUrl : '/';
		redirect = redirect.split(';')[0];
		// Redirect the user
		this.router.navigate([redirect]);
	}

	isAuthenticated(): boolean {
		return this.user.isAuthenticated();
	}

	isActive(): boolean {
		return this.user.isActive();
	}

	hasRoles(roles: string[]): boolean {
		return this.user.hasRoles(roles);
	}

	hasRole(role: string): boolean {
		return this.user.hasRole(role);
	}

	clearUser() {
		this.user.clearUser();
	}
}
