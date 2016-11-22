import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { WelcomeComponent } from './welcome.component';
import { MessagesComponent } from './messages.component';
import { ExternalLinksComponent } from './external-links.component';
import { UtilModule } from '../shared/util.module';
import { WelcomeRoutingModule } from './welcome-routes.module';

@NgModule({
	imports: [
		CommonModule,
		Ng2BootstrapModule,
		UtilModule,
		WelcomeRoutingModule
	],
	exports: [],
	declarations: [
		WelcomeComponent,
		MessagesComponent,
		ExternalLinksComponent
	],
	providers: []
})
export class WelcomeModule {
}
