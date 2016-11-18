import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, Observer } from 'rxjs';

import { UserStateService } from '../admin/authentication/user-state.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(
				private userStateService: UserStateService,
				private authService: AuthenticationService,
				private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		// This chain of observables subscribes to the fact that authService may still be initializing when the
		// app first loads.  We need to wait for an attempted authentication of the user, eua so we subscribe
		// to its initializing property.  Returning an Observable from this function (canActivate) tells angular to
		// wait until it is done before activating the route.
		return Observable.create( (observer: Observer<boolean>) => {
			this.authService.initializing$
				.subscribe( (isInitializing: boolean) => {
					console.debug(`AuthService isInitializing: ${isInitializing}`);
					if (!isInitializing) {
						console.debug('AuthService done initializing, AuthGuard is evaluating access');
						let url: string = state.url;
						observer.next(this.checkAccess(url, route));
						observer.complete();
					}
				});
		});
	}

	/**
	 *
	 * @param  url - If set, LoginComponent redirects to authRedirectUrl upon successful login
	 * @param route - activated route
	 * @returns {boolean} - true if passes checkes; false otherwise
	 */
	protected checkAccess(url: string, route: ActivatedRouteSnapshot): boolean {
		let requiresAuthentication: boolean = true; // default this to true unless told otherwise...

		// Only set it to false if it is explicitly set
		if (null != route.data && (<any> route.data).requiresAuthentication === false) {
			requiresAuthentication = false;
		}

		// -----------------------------------------------------------
		// Does the user need to log in?
		// -----------------------------------------------------------


		// If the route requires authentication and the user is not authenticated, then go to the signin route
		if (url !== '/signin' && requiresAuthentication && !this.userStateService.isAuthenticated()) {
			console.debug('UserState: User is not authenticated, go to signin');
			// Store the attempted URL so we can redirect after successful login
			this.userStateService.authRedirectUrl = url;
			this.router.navigate(['/signin']);
			return false;
		}

		// -----------------------------------------------------------
		// Does the user need to accept the user agreement??
		// -----------------------------------------------------------
		// Check to see if the user needs to agree to the end user agreement
		if (this.userStateService.isAuthenticated() && !this.userStateService.user.isAdmin() && !this.userStateService.user.isEuaCurrent() ) {
			if (url !== '/user-eua') {
				this.userStateService.authRedirectUrl = url;
				console.debug('UserState: User is authenticated, but needs to accept EUA, go to user-eua');
				this.router.navigate(['/user-eua']);
				return false;
			}
		}

		return this.checkAdminAccess(url, route);
	}

	protected checkAdminAccess(url: string, route: ActivatedRouteSnapshot): boolean {
		if (!this.userStateService.user.isAdmin()) {
			// -----------------------------------------------------------
			// Check the role requirements for the route
			// -----------------------------------------------------------

			// compile a list of roles that are missing
			let requiredRoles = (null != route.data && null != (<any> route.data).roles) ? (<any> route.data).roles : ['user'];
			let missingRoles: any[] = [];
			requiredRoles.forEach( (role: any) => {
				if (!this.userStateService.hasRole(role)) {
					missingRoles.push(role);
				}
			});

			// If there are roles missing then we need to do something
			if (missingRoles.length > 0) {

				if (this.userStateService.isAuthenticated() && !this.userStateService.hasRole('user')) {

					// If the user is missing the user role, they are pending
					if (url !== '/inactive-user') {
						this.userStateService.authRedirectUrl = url;
						console.debug('UserState: User is authenticated, but account is not active, go to inactive-user');
						this.router.navigate(['/inactive-user']);
						return false;
					}
				}
				else {
					// The user doesn't have the needed roles to view the page
					if (url !== '/unauthorized') {
						this.userStateService.authRedirectUrl = url;
						console.debug('UserState: User is authenticated, but doesn\'t have the roles needed to view the page, go to user.unauthorized');
						this.router.navigate(['/unauthorized']);
						return false;
					}
				}

			}
		}

		return true;
	}

}
