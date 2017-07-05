import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { Observable, BehaviorSubject } from 'rxjs';

import { AsyHttp, HttpOptions } from 'app/shared';

import { User } from '../user';
import { UserStateService } from './user-state.service';

@Injectable()
export class AuthenticationService {

	public initializing$: BehaviorSubject<boolean>
		= <BehaviorSubject<boolean>> new BehaviorSubject(true);

	constructor(
		private userStateService: UserStateService,
		private asyHttp: AsyHttp
	) {
		this.reloadCurrentUser()
			.subscribe(
				() => {},
				(err: any) => {
					Observable.throw(err);
				},
				() => {
					if (this.getCurrentUser().isAuthenticated()) {
						this.reloadCurrentEua();
					}
					this.initializing$.next(false);
				}
			);
	}

	public signin(user: User) {
		return this.asyHttp.post(new HttpOptions(
			'auth/signin',
			(data: any) => this.getCurrentUser().setFromUserModel(data),
			user.credentials,
			() => this.initializing$.next(false)
		));
	}

	public signup(user: User) {
		return this.asyHttp.post(new HttpOptions(
			'auth/signup',
			() => {},
			user.userModel
		));
	};

	// Get the user who is currently logged in (or null if no one is logged in)
	public getCurrentUser(): User {
		return this.userStateService.user;
	}

	public reloadCurrentUser(): Observable<any> {
		return this.asyHttp.get(new HttpOptions(
			'user/me',
			(user: any) => this.getCurrentUser().setFromUserModel(user),
			{},
			() => this.initializing$.next(false)
		));
	}

	public acceptEua() {
		return this.asyHttp.post(new HttpOptions(
			'eua/accept',
			(user: any) => this.getCurrentUser().setFromUserModel(user),
			{},
			() => this.initializing$.next(false)
		));
	}

	public getCurrentEua() {
		return this.asyHttp.get(new HttpOptions(
			'eua',
			(eua: any) => {
				this.getCurrentUser().setEua(eua);
			}
		));
	}

	// Retrieve Current EUA
	public reloadCurrentEua(): Observable<any> {
		return this.asyHttp.get(new HttpOptions(
			'eua',
			(eua: any) => { this.getCurrentUser().setEua(eua); }
		));
	}

	public forgotPassword(username: string): Observable<any> {
		return this.asyHttp.post(new HttpOptions('auth/forgot', () => {}, { username: username }));
	}

	public validateToken(token: string): Observable<any> {
		return this.asyHttp.get(new HttpOptions(`auth/reset/${token}`, () => {}));
	}

	/**
	 * Validate a pair of passwords
	 * The server will perform full validation, so for now all we're really doing is
	 * verifying that the two passwords are the same.
	 */
	public validatePassword(p1: string, p2: string): any {
		p1 = (_.isString(p1) && p1.trim().length > 0) ? p1 : undefined;
		p2 = (_.isString(p2) && p2.trim().length > 0) ? p2 : undefined;

		if (p1 !== p2) {
			return { valid: false, message: 'Passwords do not match' };
		}
		else {
			return { valid: true };
		}
	}

	public resetPassword(token: string, password: string) {
		return this.asyHttp.post(new HttpOptions(`auth/reset/${token}`, () => {}, { password: password }));
	}

}
