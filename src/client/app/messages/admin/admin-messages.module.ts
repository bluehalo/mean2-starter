import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { UtilModule } from 'app/shared/util.module';
import { CreateMessageComponent } from './create-message.component';
import { ListMessagesComponent } from './list-messages.component';
import { AdminMessagesRoutingModule } from './admin-messages-routing.module';
import { MessagesModule } from '../messages.module';
import { UpdateMessageComponent } from './edit-message.component';

@NgModule({
	imports: [
		AdminMessagesRoutingModule,
		CommonModule,
		FormsModule,
		RouterModule,
		MessagesModule,

		Ng2BootstrapModule,
		UtilModule
	],
	exports: [],
	declarations: [
		UpdateMessageComponent,
		CreateMessageComponent,
		ListMessagesComponent
	],
	providers: [
	]
})
export class AdminMessagesModule {
}
