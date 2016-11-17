import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AdminModule } from './admin/admin.module';
import { AccessCheckerModule } from './access-checker/access-checker.module';
import { AuditModule } from './audit/audit.module';
import { HeaderComponent, FooterComponent } from './core/components/core.client.component';
import { LoggedInComponent } from './core/components/logged-in.client.component';
import { InvalidResourceComponent } from './core/components/invalid-resource.client.component';
import { AuthenticationService } from './admin/services/authentication.client.service';
import { AuthGuard } from './core/services/auth-guard.service';
import { UserStateService } from './admin/services/user-state.client.service';
import { ConfigService } from './core/services/config.client.service';
import { UtilModule } from './shared/util.module';
import { ClientConfiguration } from './config/configurator';
import { BaseService } from './config/test/test-stub-service.client.service';
import { HelpModule } from './help/help.module';
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';

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

		AccessCheckerModule,
		AdminModule,
		AuditModule,
		HelpModule,
		ProjectsModule,
		TeamsModule,
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
