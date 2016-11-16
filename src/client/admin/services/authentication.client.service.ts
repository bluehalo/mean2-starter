import { Injectable } from '@angular/core';

import { User } from '../model/user.client.class';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserStateService } from './user-state.client.service';
import { AsyHttp, HttpOptions } from '../../shared/services/asy-http.client.service';
import { ObservableUtils } from '../../shared/util/observable-utils.client.class';

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
