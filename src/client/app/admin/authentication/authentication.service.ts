import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable} from 'rxjs/Observable';

import { User } from '../user.class';
import { UserStateService } from './user-state.service';
import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';

@Injectable()
export class AuthenticationService {

	initializing$: BehaviorSubject<boolean> = new BehaviorSubject(true);

	constructor(
		private userStateService: UserStateService,
		private asyHttp: AsyHttp
	) {
		this.reloadCurrentUser().subscribe(
			() => {},
			(err: HttpErrorResponse) => Observable.throw(err),
			() => {
				if (this.getCurrentUser().isAuthenticated()) {
					this.reloadCurrentEua();
				}
				this.initializing$.next(false);
			}
		);
	}

	signin(user: User): Observable<any> {
		return this.asyHttp.post(new HttpOptions('auth/signin',
			(data: any) => this.getCurrentUser().setFromUserModel(data),
			user.credentials,
			() => this.initializing$.next(false)
		));
	}

	signup(user: User): Observable<any> {
		return this.asyHttp.post(new HttpOptions('auth/signup', () => {}, user.userModel));
	}

	// Get the user who is currently logged in (or null if no one is logged in)
	getCurrentUser(): User {
		return this.userStateService.user;
	}

	reloadCurrentUser(): Observable<any> {
		return this.asyHttp.get(new HttpOptions(
			'user/me',
			(user: any) => this.getCurrentUser().setFromUserModel(user),
			{},
			() => this.initializing$.next(false)
		));
	}

	acceptEua(): Observable<any> {
		return this.asyHttp.post(new HttpOptions(
			'eua/accept',
			(user: any) => this.getCurrentUser().setFromUserModel(user),
			{},
			() => this.initializing$.next(false)
		));
	}

	getCurrentEua(): Observable<any> {
		return this.asyHttp.get(new HttpOptions('eua', (eua: any) => this.getCurrentUser().setEua(eua)));
	}

	// Retrieve Current EUA
	reloadCurrentEua(): Observable<any> {
		return this.asyHttp.get(new HttpOptions('eua', (eua: any) => this.getCurrentUser().setEua(eua)));
	}

	forgotPassword(username: string): Observable<any> {
		return this.asyHttp.post(new HttpOptions('auth/forgot', () => {}, { username: username }));
	}

	validateToken(token: string): Observable<any> {
		return this.asyHttp.get(new HttpOptions(`auth/reset/${token}`, () => {}));
	}

	/**
	 * Validate a pair of passwords
	 * The server will perform full validation, so for now all we're really doing is
	 * verifying that the two passwords are the same.
	 */
	validatePassword(p1: string, p2: string): any {
		p1 = (_.isString(p1) && p1.trim().length > 0) ? p1 : undefined;
		p2 = (_.isString(p2) && p2.trim().length > 0) ? p2 : undefined;

		if (p1 !== p2) {
			return { valid: false, message: 'Passwords do not match' };
		}
		else {
			return { valid: true };
		}
	}

	resetPassword(token: string, password: string): Observable<any> {
		return this.asyHttp.post(new HttpOptions(`auth/reset/${token}`, () => {}, { password: password }));
	}

}
