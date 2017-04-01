import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocketService } from 'app/core';
import { UtilModule } from 'app/shared';

import { MessageHandlerService } from './message-handler.service';
import { MessageService } from './message.service';
import { MessagesComponent } from './messages.component';
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
