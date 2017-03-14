import { Component, ViewContainerRef } from '@angular/core';
import { Overlay } from 'angular2-modal';
import { ConfigService } from './core/config.service';
import { MessageHandlerService } from './messages/message-handler.service';
import { SocketService } from './core/socket.service';
import { TranslateService } from '@ngx-translate/core';

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
		public messageHandlerServce: MessageHandlerService,
		public translate: TranslateService
	) {
		// This is necessary for angular2-modal.
		overlay.defaultViewContainer = viewContainerRef;

		// this language will be used as a fallback when a translation isn't found in the current language
		translate.setDefaultLang('en');

		// set language to use
		translate.use('en');
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
