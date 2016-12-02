import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'capitalize'})
export class CapitalizePipe implements PipeTransform {

	transform(value: string): string {
		if (null != value) {
			return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
		}

		return value;
	}
}
