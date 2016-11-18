import { NgModule } from '@angular/core';
import { AdminMessagesModule } from './admin/admin-messages.module';
import { MessageHandlerService } from './message-handler.service';

@NgModule({
	imports: [AdminMessagesModule],
	exports: [
		AdminMessagesModule,
		MessageHandlerService
	],
	declarations: [],
	providers: [MessageHandlerService],
})
export class MessagesModule {
}
