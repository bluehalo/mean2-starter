import { Component, ViewContainerRef } from '@angular/core';
import { Overlay } from 'angular2-modal';
import { ConfigService } from './core/config.service';
import { MessageHandlerService } from './messages/message-handler.service';
import { SocketService } from './core/services/socket.service';

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
		viewContainerRef: ViewContainerRef,
		private socketService: SocketService,
		private messageHandlerServce: MessageHandlerService,
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
