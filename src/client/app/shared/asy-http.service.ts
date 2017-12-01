import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

import { UserStateService } from '../admin/authentication/user-state.service';

export class HttpOptions {
	public urlParams: HttpParams;

	constructor(
		public url: string,
		public dataFn: Function = () => {},
		public data: any = {},
		public completeFn: Function = (): any => null,
		public errFn: Function = AsyHttp.defaultErrFn,
		public type: string = 'get') {
	}

	public setParamsFromObject(obj: any) {
		this.urlParams = new HttpParams();
		Object.keys(obj).forEach( (key) => this.urlParams.set(key, obj[key]) );
	}
}

@Injectable()
export class AsyHttp {

	constructor(
		private userStateService: UserStateService,
		private _http: HttpClient,
		private router: Router,
		private location: Location
	) {}

	static defaultErrFn(_err: any) { }

	get(opts: HttpOptions) {
		let headers = new HttpHeaders({
			'Interface-URL': this.getUriEncodedPath()
		});

		let observable = this._http.get(opts.url, { params: opts.urlParams, headers: headers } )
			.share()
			.catch((error: HttpErrorResponse) => this.handleErrorResponse(error));

		observable.subscribe(
			(data: any) => opts.dataFn(data),
			(err: any) => opts.errFn(err),
			() => opts.completeFn()
		);

		return observable;
	}

	post(opts: HttpOptions) {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Interface-URL': this.getUriEncodedPath()
		});

		let observable = this._http.post(opts.url, JSON.stringify(opts.data), { headers: headers })
			.share()
			.catch((error: HttpErrorResponse) => this.handleErrorResponse(error));

		observable.subscribe(
			(data: any) => opts.dataFn(data),
			(err: HttpErrorResponse) => opts.errFn(err),
			() => opts.completeFn()
		);

		return observable;
	}

	put(opts: HttpOptions) {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Interface-URL': this.getUriEncodedPath()
		});

		let observable = this._http.put(opts.url, JSON.stringify(opts.data), { headers: headers })
			.share()
			.catch((error: HttpErrorResponse) => this.handleErrorResponse(error));

		observable.subscribe(
			(data: any) => opts.dataFn(data),
			(err: any) => opts.errFn(err),
			() => opts.completeFn()
		);

		return observable;
	}

	delete(opts: HttpOptions) {
		let headers = new HttpHeaders({
			'Interface-URL': this.getUriEncodedPath()
		});

		let observable = this._http.delete(opts.url, { headers: headers})
			.share()
			.catch((error: HttpErrorResponse) => this.handleErrorResponse(error));

		observable.subscribe(
			(data: any) => opts.dataFn(data),
			(err: any) => opts.errFn(err),
			() => opts.completeFn()
		);

		return observable;
	}

	urlEncode(obj: any): string {
		return Object.getOwnPropertyNames(obj).filter((key: string) => null != obj[key]).reduce((p: HttpParams, key: string) => p.set(key, obj[key]), new HttpParams()).toString();
	}

	protected handleErrorResponse(err: HttpErrorResponse): Observable<any> {
		const type = err.error.type;
		switch (err.status) {
			case 401:

				// Deauthenticate the global user
				this.userStateService.user.clearUser();


				if (type === 'invalid-certificate') {
					// Redirect to invalid credentials page
					this.router.navigate(['/invalid-certificate']);
				}
				else {
					// Signin protection is handled by the AuthGuard on specific routes
				}

				break;
			case 403:
				if (type === 'eua') {
					this.router.navigate(['/user-eua']);
				}
				else if (type === 'inactive') {
					this.router.navigate(['/inactive-user']);
				}
				else if (type === 'noaccess') {
					this.router.navigate(['/no-access']);
				}
				else {
					// Add unauthorized behavior
					this.router.navigate(['/unauthorized']);
				}
				break;

			default:
				break;
		}

		if (err.status === 401
			&& !_.endsWith(err.url, 'auth/signin')) {
			if (!_.endsWith(err.url, 'user/me')) {
				this.router.navigate(['/signin']);
			}
			return Observable.empty();
		}
		else {
			return Observable.throw(err);
		}

	}

	private getUriEncodedPath() {
		let path = this.location.path();
		let alreadyEncoded = decodeURI(path) !== path;
		return alreadyEncoded ? path : encodeURI(this.location.path());
	}
}
