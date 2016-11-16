import {Http, Request, RequestOptionsArgs, Response, RequestOptions, ConnectionBackend, Headers} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from '../../admin/services/authentication.client.service';

export class HttpInterceptor extends Http {

	constructor(
		backend: ConnectionBackend,
		defaultOptions: RequestOptions,
		protected auth: AuthenticationService
	) {
		super(backend, defaultOptions);
	}

	request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.request(url, options));
	}

	get(url: string, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.get(url, options));
	}

	post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
	}

	put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
	}

	delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.delete(url, options));
	}

	getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
		if (options == null) {
			options = new RequestOptions();
		}
		if (options.headers == null) {
			options.headers = new Headers();
		}
		if (!options.headers.get('Content-Type')) {
			options.headers.append('Content-Type', 'application/json');
		}
		return options;
	}

	intercept(observable: Observable<Response>): Observable<Response> {
		return null;
		// return observable.catch((err, source:Observable<Response>) => {
			// let errData = JSON.parse(err._body);
			// switch (err.status) {
			// 	case 401:
			// 		// Deauthenticate the global user
			// 		this.auth.clearUser();
			//
			// 		if(errData.type === 'invalid-certificate') {
			// 			// Redirect to invalid credentials page
			// 			console.debug('UserState: Server doesn\'t recognize the submitted cert, go to the invalid cert page');
			// 			this._router.navigate([this.asyRoutes.getPath('InvalidCertificate')]);
			// 		}
			// 		else {
			// 			// Redirect to signin page
			// 			console.debug('UserState: Server doesn\'t think the user is authenticated, go to auth.signin');
			// 			this._router.navigate([this.asyRoutes.getPath('SignIn')]);
			// 		}
			//
			// 		break;
			// 	case 403:
			// 		if (errData.type === 'eua') {
			// 			console.debug('UserState: Server thinks the user needs to accept eua, go to user.eua');
			// 			this._router.navigate([this.asyRoutes.getPath('UserEua')]);
			// 		}
			// 		else if (errData.type === 'inactive') {
			// 			console.debug('UserState: Server thinks the user is inactive, go to auth.inactive');
			// 			this._router.navigate([this.asyRoutes.getPath('Inactive')]);
			// 		}
			// 		else if (errData.type === 'noaccess') {
			// 			console.debug('UserState: Server thinks the user does not have the required access, go to user.noaccess');
			// 			this._router.navigate([this.asyRoutes.getPath('NoAccess')]);
			// 		}
			// 		else {
			// 			// Add unauthorized behavior
			// 			console.debug('UserState: Server thinks the user accessed something they shouldn\'t, go to user.unauthorized');
			// 			this._router.navigate([this.asyRoutes.getPath('Unauthorized')]);
			// 		}
			// 		break;
			// }
			//
			// if (err.status  == 401 && !_.endsWith(err.url, 'api/auth/login')) {
			// 	this._router.navigate([this.asyRoutes.getPath('SignIn')]);
			// 	return Observable.empty();
			// } else {
			// 	return Observable.throw(err);
			// }
		// });

	}
}
