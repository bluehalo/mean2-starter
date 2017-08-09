import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap';

import { UtilModule } from '../../shared/util.module';
import { CreateMessageComponent } from './create-message.component';
import { ListMessagesComponent } from './list-messages.component';
import { AdminMessagesRoutingModule } from './admin-messages-routing.module';
import { MessagesModule } from '../messages.module';
import { UpdateMessageComponent } from './edit-message.component';

@NgModule({
	imports: [
		AlertModule.forRoot(),

		AdminMessagesRoutingModule,
		CommonModule,
		FormsModule,
		RouterModule,
		MessagesModule,
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
