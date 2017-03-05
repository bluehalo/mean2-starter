import { Component, Input } from '@angular/core';
import { ConfigService } from '../core/config.service';
import * as _ from 'lodash';

@Component({
	selector: 'asy-safe-image',
	template: `<img class="{{imgClass}}" src="{{imgSource}}" (error)="useDefaultUrl($event)"/>`
})
export class SafeImageComponent {

	@Input() imgClass: string = '';

	@Input() imgSource: string = '';

	@Input() showDefault: boolean = true;

	defaultPicSrc: string;

	constructor(public configService: ConfigService) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.defaultPicSrc = config.defaultImage;
			});

		if (_.isEmpty(this.imgSource)) {
			this.imgSource = this.defaultPicSrc;
		}
	}

	useDefaultUrl(event: any) {
		if (this.showDefault) {
			this.imgSource = this.defaultPicSrc;
		} else {
			this.imgClass = 'hidden';
		}
	}
}
