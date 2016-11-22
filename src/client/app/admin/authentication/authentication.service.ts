import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';

import { User } from '../user.class';
import { UserStateService } from './user-state.service';
import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';
import { ObservableUtils } from '../../shared/observable-utils.class';

@Injectable()
export class AuthenticationService {

	public initializing$: BehaviorSubject<boolean>
		= <BehaviorSubject<boolean>> new BehaviorSubject(true);

	constructor(
		private userStateService: UserStateService,
		private asyHttp: AsyHttp
	) {
		ObservableUtils.wrapArray([
			this.reloadCurrentUser(),
			this.reloadCurrentEua()
		]).subscribe(
			() => this.initializing$.next(false),
			(err: any) => Observable.throw(err)
		);
	}

	public signin(user: User) {
		return this.asyHttp.post(new HttpOptions(
			'auth/signin',
			(data: any) => this.getCurrentUser().setFromUserModel(data),
			user.credentials
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
		let wasAuthenticated = this.getCurrentUser().isAuthenticated();
		return this.asyHttp.get(new HttpOptions(
			'user/me',
			(user: any) => {
				this.getCurrentUser().setFromUserModel(user);
				if (!wasAuthenticated && this.getCurrentUser().isAuthenticated()) {
					 // this.router.navigateByInstruction(this.router.currentInstruction);
				}
			},
			(err: any) => {},
			() => {
				this.initializing$.next(false);
			}
		));
	}

	public acceptEua() {
		return this.asyHttp.post(new HttpOptions(
			'eua/accept',
			(user: any) => {
				this.getCurrentUser().setFromUserModel(user);
			}
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

}
