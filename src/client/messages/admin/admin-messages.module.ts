import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { UtilModule } from '../../shared/util.module';
import { CreateMessageComponent } from './create-message.component';
import { AdminUpdateMessageComponent } from './edit-message.component';
import { ListMessagesComponent } from './list-messages.component';
import { AdminMessagesRoutingModule } from './admin-messages-routes.module';
import { MessagesModule } from '../messages.module';
import { MessageService } from '../message.service';

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
		AdminUpdateMessageComponent,
		CreateMessageComponent,
		ListMessagesComponent
	],
	providers: [
	]
})
export class AdminMessagesModule {
}
