import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { BsDropdownModule } from 'ngx-bootstrap';

import { UtilModule } from '../shared/util.module';
import { NotificationService } from './notification.service';
import { NotificationIndicatorComponent } from './notification-indicator.component';
import { NotificationStateService } from './notification-state-service';
import { NotificationHandlerService } from './notification-handler.service';

@NgModule({
	imports: [
		BsDropdownModule.forRoot(),

		CommonModule,
		RouterModule,
		UtilModule
	],
	entryComponents: [
	],
	exports: [
		NotificationIndicatorComponent
	],
	declarations: [
		NotificationIndicatorComponent
	],
	providers: [
		NotificationService,
		NotificationHandlerService,
		NotificationStateService
	],
})
export class NotificationsModule {
}
