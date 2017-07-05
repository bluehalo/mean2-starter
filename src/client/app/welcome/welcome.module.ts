import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { UtilModule } from 'app/shared';
import { MessagesModule } from 'app/messages';

import { WelcomeComponent } from './welcome.component';
import { ExternalLinksComponent } from './external-links.component';
import { WelcomeRoutingModule } from './welcome-routing.module';

@NgModule({
	imports: [
		CommonModule,
		MessagesModule,
		Ng2BootstrapModule,
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
