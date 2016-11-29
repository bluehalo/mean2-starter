import { NgModule } from '@angular/core';
import { MessageHandlerService } from './message-handler.service';
import { MessageService } from './message.service';
import { SocketService } from '../core/socket.service';
import { MessagesComponent } from './messages.component';
import { UtilModule } from '../shared/util.module';
import { CommonModule } from '@angular/common';

@NgModule({
	imports: [
		CommonModule,
		UtilModule
	],
	exports: [
		MessagesComponent
	],
	declarations: [
		MessagesComponent
	],
	providers: [
		MessageService,
		MessageHandlerService,
		SocketService
	],
})
export class MessagesModule {
}
