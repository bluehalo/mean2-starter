import { NgModule } from '@angular/core';
import { MessageHandlerService } from './message-handler.service';
import { MessageService } from './message.service';
import { SocketService } from '../core/services/socket.service';

@NgModule({
	imports: [],
	exports: [],
	declarations: [],
	providers: [
		MessageService,
		MessageHandlerService,
		SocketService
	],
})
export class MessagesModule {
}
