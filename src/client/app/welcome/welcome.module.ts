import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { WelcomeComponent } from './welcome.component';
import { ExternalLinksComponent } from './external-links.component';
import { UtilModule } from 'app/shared/util.module';
import { WelcomeRoutingModule } from './welcome-routing.module';
import { MessagesModule } from 'app/messages/messages.module';

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
