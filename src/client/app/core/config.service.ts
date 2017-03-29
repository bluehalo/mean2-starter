import {Injectable} from '@angular/core';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class ConfigService {

	public getConfig() {
		return Observable.of((<any> window).config);
	}

}
