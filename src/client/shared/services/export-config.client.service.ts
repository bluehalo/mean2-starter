import { Injectable } from '@angular/core';
import { AsyHttp, HttpOptions } from './asy-http.client.service';

@Injectable()
/**
 * Admin management of users
 */
export class ExportConfigService {
	constructor(private asyHttp: AsyHttp) {
	}

	postCSVParams(type: string, config: any) {
		return this.asyHttp.post(new HttpOptions('/admin/requestCSV',
			() => {},
			{type: type, config: config}));
	};
}
