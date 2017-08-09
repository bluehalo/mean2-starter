import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AccordionModule, BsDropdownModule } from 'ngx-bootstrap';

import { WelcomeComponent } from './welcome.component';
import { ExternalLinksComponent } from './external-links.component';
import { UtilModule } from '../shared/util.module';
import { WelcomeRoutingModule } from './welcome-routing.module';
import { MessagesModule } from '../messages/messages.module';

@NgModule({
	imports: [
		AccordionModule.forRoot(),
		BsDropdownModule.forRoot(),

		CommonModule,
		MessagesModule,
		UtilModule,
		WelcomeRoutingModule
	],
	exports: [],
	declarations: [
		WelcomeComponent,
		ExternalLinksComponent
	],
	providers: []
})
export class WelcomeModule {
}
