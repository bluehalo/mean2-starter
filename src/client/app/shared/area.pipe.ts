import {Pipe, PipeTransform} from '@angular/core';

import * as _ from 'lodash';

@Pipe({name: 'area'})
export class AreaPipe implements PipeTransform {
	transform(metersSquaredDistance: number): string {
		if (null != metersSquaredDistance) {
			let areaKm = metersSquaredDistance / 1000000;
			if (areaKm >= 1000000) {
				return _.round(areaKm / 1000000).toLocaleString() + ' M km²';
			} else {
				return _.round(areaKm).toLocaleString() + ' km²';
			}
		}
		return '';
	}
}
