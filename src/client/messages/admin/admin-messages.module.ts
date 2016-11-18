import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { UtilModule } from '../../shared/util.module';
import { CreateMessageComponent } from './create-message.component';
import { AdminUpdateMessageComponent } from './edit-message.component';
import { ListMessagesComponent } from './list-messages.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		Ng2BootstrapModule,
		UtilModule
	],
	exports: [],
	declarations: [
		AdminUpdateMessageComponent,
		CreateMessageComponent,
		ListMessagesComponent
	],
	providers: []
})
export class AdminMessagesModule {
}
