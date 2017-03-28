import { Component, Input } from '@angular/core';

import { ConfigService } from '../core/config.service';
import { StringUtils } from './string-utils.service';

@Component({
	selector: 'asy-safe-image',
	template: `<img class="{{imgClass}}" src="{{imgSource}}" (error)="useDefaultUrl($event)"/>`
})
export class SafeImageComponent {

	@Input() imgClass: string = '';

	@Input() imgSource: string = '';

	@Input() showDefault: boolean = true;

	private defaultPicSrc: string;

	constructor(
		private configService: ConfigService) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.defaultPicSrc = config.defaultImage;
			});

		if (StringUtils.isInvalid(this.imgSource)) {
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
