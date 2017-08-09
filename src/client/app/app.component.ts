import { Component } from '@angular/core';

import { ConfigService } from './core/config.service';
import { MessageHandlerService } from './messages/message-handler.service';
import { SocketService } from './core/socket.service';

@Component({
	selector: 'app-component',
	templateUrl: './app.component.html'
})

export class AppComponent {

	banner: any;

	constructor(
		public configService: ConfigService,
		public socketService: SocketService,
		public messageHandlerServce: MessageHandlerService
	) {}

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
