import {Pipe, PipeTransform} from '@angular/core';
import {StringUtils} from './string-utils.service';

@Pipe({name: 'camelToHuman'})
export class CamelToHumanPipe implements PipeTransform {
	transform(s: string): string {
		return StringUtils.camelToHuman(s);
	}
}
