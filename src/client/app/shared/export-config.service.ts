import { Injectable } from '@angular/core';

import { AsyHttp, HttpOptions } from './asy-http.service';

@Injectable()
/**
 * Admin management of users
 */
export class ExportConfigService {
	constructor(private asyHttp: AsyHttp) {
	}

	postExportConfig(type: string, config: any) {
		return this.asyHttp.post(new HttpOptions('/requestExport',
			() => {},
			{type: type, config: config}));
	};
}
