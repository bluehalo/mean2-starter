import { Pipe, PipeTransform } from '@angular/core';

import * as _ from 'lodash';

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
	transform(obj: any): any {
		let values: any[] = [];
		_.forOwn(obj, (val, key) => {
			values.push({key: key, value: val});
		});
		return values;
	}
}
