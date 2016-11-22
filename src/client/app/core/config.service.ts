import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';

import { ClientConfiguration } from '../config/configurator';

@Injectable()
export class ConfigService {
	constructor(private clientConfig: ClientConfiguration) {}

	public getConfig() {
		let config: any = (<any> window).config;
		config.clientConfiguration = this.clientConfig;

		return Observable.of((<any> window).config);
	}
}
