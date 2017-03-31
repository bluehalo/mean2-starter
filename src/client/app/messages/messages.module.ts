import { NgModule } from '@angular/core';
import { MessageHandlerService } from './message-handler.service';
import { MessageService } from './message.service';
import { SocketService } from 'app/core/socket.service';
import { MessagesComponent } from './messages.component';
import { UtilModule } from 'app/shared/util.module';
import { CommonModule } from '@angular/common';
import { MessageAudit } from './audit/message-audit.component';

@NgModule({
	imports: [
		CommonModule,
		UtilModule
	],
	entryComponents: [
		MessageAudit
	],
	exports: [
		MessageAudit,
		MessagesComponent
	],
	declarations: [
		MessageAudit,
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
