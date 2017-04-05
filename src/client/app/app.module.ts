import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

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
import { ResourcesModule } from './resources/resources.module';
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
import { NotificationsModule } from './notifications/notifications.module';

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

export function HttpLoaderFactory(http: Http) {
	return new TranslateHttpLoader(http, 'dev/locale-', '.json');
}

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [Http]
			}
		}),

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
