import { Component, ViewContainerRef } from '@angular/core';
import { Overlay } from 'angular2-modal';
import { ConfigService } from './core/config.service';

@Component({
	selector: 'app-component',
	templateUrl: './app.component.html'
})

export class AppComponent {
	private banner: any;
	private viewContainerRef: ViewContainerRef;
	constructor(
		private configService: ConfigService,
		private overlay: Overlay,
		viewContainerRef: ViewContainerRef
	) {
		// This is necessary for angular2-modal.
		overlay.defaultViewContainer = viewContainerRef;
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe( (config: any) =>  {
				this.banner = config.banner;
			});
	}
}
