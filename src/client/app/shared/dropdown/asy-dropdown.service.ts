import { Injectable } from '@angular/core';

import { AsyDropdownHandlers } from './asy-dropdown-type.class';

@Injectable()
export class AsyDropdownService {

	getMenuForMode(mode: string) {
		let options = AsyDropdownHandlers.handlers[mode];
		return (null != options) ? options : [];
	}
}
