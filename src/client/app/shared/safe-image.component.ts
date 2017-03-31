import { Component, Input } from '@angular/core';
import { ConfigService } from 'app/core/config.service';
import * as _ from 'lodash';

@Component({
	selector: 'asy-safe-image',
	template: `<img class="{{imgClass}}" src="{{imgSource}}" (error)="useDefaultUrl($event)"/>`
})
export class SafeImageComponent {

	@Input() imgClass: string = '';

	@Input() imgSource: string = '';

	@Input() showDefault: boolean = true;

	private defaultPicSrc: string;

	constructor(private configService: ConfigService) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.defaultPicSrc = config.defaultImage;
			});

		if (_.isString(this.imgSource) && this.imgSource.trim().length > 0) {
			this.imgSource = this.defaultPicSrc;
		}
	}

	private useDefaultUrl(event: any) {
		if (this.showDefault) {
			this.imgSource = this.defaultPicSrc;
		} else {
			this.imgClass = 'hidden';
		}
	}
}
