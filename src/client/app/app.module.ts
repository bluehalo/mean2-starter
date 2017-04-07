/**
 * CORE
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

/**
 * EXTENSIONS
 */
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { ToasterModule } from 'angular2-toaster';

/**
 * ENTRY
 */
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

/**
 * Modules
 */
import { AccessCheckerModule } from './access-checker';
import { AdminModule } from './admin';
import { AuditModule } from './audit';
import { HelpModule } from './help';
import { ResourcesModule } from './resources';
import { TeamsModule } from './teams';
import { WelcomeModule } from './welcome';
import { UtilModule } from './shared';

import { DemoModule } from './demo/demo.module';

/**
 * Components
 */
import {
	HeaderComponent,
	FooterComponent,
	LoggedInComponent,
	InvalidResourceComponent
} from './core';

/**
 * Services
 */

import { AuthenticationService, UserStateService } from './admin';
import { AuthGuard, ConfigService } from './core';
import { TeamsService } from './teams';
import { NotificationsModule } from './notifications';
@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,

		AppRoutingModule,
		Ng2BootstrapModule.forRoot(),
		ModalModule.forRoot(),
		BootstrapModalModule,
		ToasterModule,

		AccessCheckerModule,
		AdminModule,
		AuditModule,
		DemoModule,
		HelpModule,
		NotificationsModule,
		ResourcesModule,
		TeamsModule,
		UtilModule,
		WelcomeModule,
		UtilModule
	],
	declarations: [
		AppComponent,
		HeaderComponent,
		LoggedInComponent,
		InvalidResourceComponent,
		FooterComponent
	],
	bootstrap: [ AppComponent ],
	providers: [
		AuthenticationService,
		AuthGuard,
		ConfigService,
		TeamsService,
		UserStateService
	]
})
export class AppModule { }
