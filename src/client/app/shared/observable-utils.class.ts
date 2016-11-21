import { Observable } from 'rxjs';

export class ObservableUtils {
	constructor() {
	}

	public static wrapArray(items: Observable<any>[]): Observable<any> {
		return Observable
			.from(items)
			.concatAll()
			.toArray();
	}

}
