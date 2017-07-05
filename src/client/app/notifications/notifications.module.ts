import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UtilModule } from 'app/shared';

import { NotificationHandlerService } from './notification-handler.service';
import { NotificationService } from './notification.service';
import { NotificationIndicatorComponent } from './notification-indicator.component';
import { NotificationStateService } from './notification-state-service';

@NgModule({
	imports: [
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
