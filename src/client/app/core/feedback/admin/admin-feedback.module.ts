import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AlertModule, TooltipModule } from 'ngx-bootstrap';

import { UtilModule } from '../../../shared/util.module';
import { ListFeedbackComponent } from './list-feedback.component';
import { AdminFeedbackRoutingModule } from './admin-feedback-routing.module';

@NgModule({
	imports: [
		AlertModule.forRoot(),
		TooltipModule.forRoot(),

		AdminFeedbackRoutingModule,
		CommonModule,
		RouterModule,

		UtilModule
	],
	exports: [],
	declarations: [
		ListFeedbackComponent,
	],
	providers: []
})
export class AdminFeedbackModule {
}
