import * as _ from 'lodash';

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'bigNumber'})
export class BigNumberPipe implements PipeTransform {
	private scales = [
		{
			abbreviation: 'T',
			name: 'Trillion',
			multiplier: 1000000000000
		}, {
			abbreviation: 'B',
			name: 'Billion',
			multiplier: 1000000000
		}, {
			abbreviation: 'M',
			name: 'Million',
			multiplier: 1000000
		}, {
			abbreviation: 'K',
			name: 'Thousand',
			multiplier: 1000
		}, {
			abbreviation: '',
			name: '',
			multiplier: 1
		}
	];

	transform (n: number): string {
		let scale: any = this.getScale(n);
		let postfix: string = '';
		let fraction: number = n;
		let fractionSize: number;

		if (null != scale) {
			fraction = n / scale.multiplier;
			postfix = scale.abbreviation;
		}
		let fpart = Number.isInteger(fraction) ? 0 : Number.parseInt(_.last(fraction.toString().split('.')));
		// Smart behavior is to maintain a minimum of 2 significant digits once the number is larger than 10
		if (fraction === 0 || fpart < 50 || fpart >= 950) {
			fractionSize = 0;
		}
		else if (fraction < 1) {
			fractionSize = 2;
		}
		else if (Math.ceil(fraction) < 10 && n >= 1000) {
			fractionSize = 1;
		}
		else {
			fractionSize = 0;
		}

		return fraction.toFixed(fractionSize).toString() + postfix;
	}

	private getScale(n: number): any {
		let scale: any = null;

		this.scales.some(function(element, index, array) {
			// Go through the scales, biggest first, searching for the first one that divides the number
			scale = element;
			return (n / scale.multiplier >= 1);
		});

		return scale;
	}
}
