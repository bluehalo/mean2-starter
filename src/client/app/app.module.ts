import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { ToasterModule } from 'angular2-toaster';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AccessCheckerModule } from './access-checker/access-checker.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { DemoModule } from './demo/demo.module';
import { HelpModule } from './help/help.module';
import { TeamsModule } from './teams/teams.module';
import { UtilModule } from './shared/util.module';
import { WelcomeModule } from './welcome/welcome.module';

import { HeaderComponent } from './core/header.component';
import { FooterComponent } from './core/footer.component';
import { LoggedInComponent } from './core/logged-in.component';
import { InvalidResourceComponent } from './core/invalid-resource.component';

import { AuthenticationService } from './admin/authentication/authentication.service';
import { AuthGuard } from './core/auth-guard.service';
import { BaseService } from './config/test/test-stub-service.service';
import { ConfigService } from './core/config.service';
import { ClientConfiguration } from './config/configurator';
import { TeamsService } from './teams/teams.service';
import { UserStateService } from './admin/authentication/user-state.service';


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
		Ng2BootstrapModule,
		ModalModule.forRoot(),
		BootstrapModalModule,
		ToasterModule,

		AccessCheckerModule,
		AdminModule,
		AuditModule,
		DemoModule,
		HelpModule,
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
