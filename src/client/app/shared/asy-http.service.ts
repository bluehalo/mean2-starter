import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, URLSearchParams, Response } from '@angular/http';

import { Observable, Subscriber } from 'rxjs';
import * as _ from 'lodash';

export class HttpOptions {
	public urlParams: URLSearchParams;

	constructor (
		public url: string,
		public dataFn: Function = () => {},
		public data: any = {},
		public completeFn: Function = (): any => null,
		public errFn: Function = AsyHttp.defaultErrFn,
		public type: string = 'get') {

	}

	public setParamsFromObject(obj: any) {
		this.urlParams = new URLSearchParams();
		Object.keys(obj).forEach( (key) => this.urlParams.set(key, obj[key]) );
	}
}

@Injectable()
export class AsyHttp {

	private publishError: Function;

	private _errors: Observable<any>;

	constructor(
		private _http: Http,
		private router: Router,
		private location: Location) {

		this._errors = Observable.create((observer: any) => {
			this.publishError = (...a: any[]) => observer.next(...a);

			return () => {
				this.publishError = () => {};
			};
		});

		this._errors.publish();
	}

	static defaultErrFn(_err: any) { }

	public errors(): Observable<any> {
		return this._errors;
	}

	get(opts: HttpOptions) {
		let headers = new Headers({
			'Interface-URL': this.location.path()
		});

		let observable = this._http.get(opts.url, {search: opts.urlParams, headers: headers} )
			.map((res) => this.hasContent(res) ? res.json() : null)
			.share()
			.catch((error: any, caught: Observable<any>) => {
				return this.handleErrorResponse(error, caught);

			});

		observable
			.subscribe(
				(data) => opts.dataFn(data),
				(err) => opts.errFn(err),
				() => opts.completeFn()
			);

		return observable;
	}

	post(opts: HttpOptions) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Interface-URL': this.location.path()
		});

		let observable = this._http.post(opts.url, JSON.stringify(opts.data), {
			headers: headers
		})
			.map((res) => this.hasContent(res) ? res.json() : null)
			.share()
			.catch((error: any, caught: Observable<any>) => {
				return this.handleErrorResponse(error, caught);
			});

		observable
			.subscribe(
				(data) => opts.dataFn(data),
				(err) => opts.errFn(err),
				() => opts.completeFn()
			);
		return observable;
	}

	put(opts: HttpOptions) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Interface-URL': this.location.path()
		});

		let observable = this._http.put(opts.url, JSON.stringify(opts.data), {
			headers: headers
		})
			.map((res) => this.hasContent(res) ? res.json() : null)
			.share()
			.catch((error: any, caught: Observable<any>) => {
				return this.handleErrorResponse(error, caught);
			});

		observable
			.subscribe(
				(data) => opts.dataFn(data),
				(err) => opts.errFn(err),
				() => opts.completeFn()
			);
		return observable;
	}

	delete(opts: HttpOptions) {
		let headers = new Headers({
			'Interface-URL': this.location.path()
		});

		let observable = this._http.delete(opts.url, { headers: headers})
			.map((res) => this.hasContent(res) ? res.json() : null)
			.share()
			.catch((error: any, caught: Observable<any>) => {
				return this.handleErrorResponse(error, caught);
			});

		observable
			.subscribe(
				(data) => opts.dataFn(data),
				(err) => opts.errFn(err),
				() => opts.completeFn()
			);
		return observable;
	}

	urlEncode(obj: any): string {
		let urlSearchParams = new URLSearchParams();
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				urlSearchParams.append(key, obj[key]);
			}
		}
		return urlSearchParams.toString();
	}

	protected handleErrorResponse(err: any, _caught: Observable<any>): Observable<any> {
		let errData = JSON.parse(err._body);
		try {
			this.publishError(err);
		} catch (e) {
			console.log(e);
		}

		switch (err.status) {
			case 401:

				if (errData.type === 'invalid-certificate') {
					// Redirect to invalid credentials page
					this.router.navigate(['/invalid-certificate']);
				}
				else {
					// Signin protection is handled by the AuthGuard on specific routes
				}

				break;
			case 403:
				if (errData.type === 'eua') {
					this.router.navigate(['/user-eua']);
				}
				else if (errData.type === 'inactive') {
					this.router.navigate(['/inactive-user']);
				}
				else if (errData.type === 'noaccess') {
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

	private hasContent(res: Response) {
		return (res.status !== 204 && (<string> res.text()).length > 0);
	}

}
