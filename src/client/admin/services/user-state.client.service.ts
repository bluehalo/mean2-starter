import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../model/user.client.class';

/**
 *
 */
@Injectable()
export class UserStateService {

	public user: User = new User();
	public authRedirectUrl: string; // Can maintain state of a url to redirect to after login

	constructor(private router: Router) {}

	/**
	 * Redirect the user to the last attempted route
	 */
	public goToRedirectRoute() {
		// Check if we stored a redirect url.  This is set by the AuthGuard if a prior attempt
		// to navigate somewhere failed.  Send the user back where they were trying to go...
		let redirect = this.authRedirectUrl ? this.authRedirectUrl : '/';
		redirect = redirect.split(';')[0];
		// Redirect the user
		console.debug(`Redirecting user to ${redirect}`);
		this.router.navigate([redirect]);
	}

	public isAuthenticated(): boolean {
		return this.user.isAuthenticated();
	}

	public hasRoles(roles: string[]): boolean {
		return this.user.hasRoles(roles);
	}

	public hasRole(role: string): boolean {
		return this.user.hasRole(role);
	}

	public clearUser() {
		this.user.clearUser();
	}
}
