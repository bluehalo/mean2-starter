import {Injectable} from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { ClientConfiguration } from 'app/config';

@Injectable()
export class ConfigService {

	public getConfig() {
		return Observable.of((<any> window).config);
	}

}

