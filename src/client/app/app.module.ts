/**
 * CORE
 */
import { NgModule, APP_INITIALIZER } from '@angular/core';
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

import { DemoModule } from './demo/demo.module';
import { UtilModule } from './shared/util.module';

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
import { BaseService } from './config/test/test-stub-service.service';

import { AuthenticationService, UserStateService } from './admin';
import { AuthGuard, ConfigService } from './core';
import { ClientConfiguration } from './config';
import { TeamsService } from './teams';
import { NotificationsModule } from './notifications';


export function initializerFactory () {
	return () => () => new Promise<any>( (resolve) => {
		ClientConfiguration.initializing$
			.subscribe( (initialized) => {
				if (initialized) {
					resolve();
				}
			});
	});
}
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
		ClientConfiguration,
		ConfigService,
		TeamsService,
		UserStateService,
		{
			provide: BaseService,
			useClass: ClientConfiguration.config.providers.BaseService.useClass
		},
		{
			provide: APP_INITIALIZER,
			multi: true,
			useFactory: initializerFactory
		}
	]
})
export class AppModule { }
