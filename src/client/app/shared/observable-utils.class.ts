import { Observable } from 'rxjs';
import { ObservableResult } from './observable-result.class';

export class ObservableUtils {
	constructor() {
	}

	public static wrapArray(items: Observable<any>[]): Observable<any> {
		return Observable
			.from(items)
			.concatAll()
			.toArray();
	}

	public static forkJoinSettled(observables: Observable<any>[]): Observable<any> {
		return Observable.forkJoin(observables.map((obs) => {
				return obs
					.map(val => new ObservableResult('success', val))
					.catch(err => Observable.of(new ObservableResult('error', err)))
			})
		);
	}

}
