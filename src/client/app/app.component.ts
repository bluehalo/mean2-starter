import { Component, ViewContainerRef } from '@angular/core';
import { Overlay } from 'angular2-modal';

import { ConfigService, SocketService } from './core';
import { MessageHandlerService } from './messages/message-handler.service';

@Component({
	selector: 'app-component',
	templateUrl: './app.component.html'
})

export class AppComponent {

	banner: any;

	constructor(
		public configService: ConfigService,
		public overlay: Overlay,
		public viewContainerRef: ViewContainerRef,
		public socketService: SocketService,
		public messageHandlerServce: MessageHandlerService
	) {
		// This is necessary for angular2-modal.
		overlay.defaultViewContainer = viewContainerRef;
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe( (config: any) =>  {
				this.banner = config.banner;
			});

		// Subscribe to the user-loaded event and initialize the socket/messaging system
		this.socketService.initialize();
		this.messageHandlerServce.initialize();
	}
}
