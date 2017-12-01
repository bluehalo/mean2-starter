import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BsDropdownModule, CollapseModule, ModalModule, TooltipModule } from 'ngx-bootstrap';
import { ToasterModule, ToasterService } from 'angular2-toaster';

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
import { ConfigService } from './core/config.service';
import { SocketService } from './core/socket.service';
import { TeamsService } from './teams/teams.service';
import { UserStateService } from './admin/authentication/user-state.service';
import { NotificationsModule } from './notifications/notifications.module';
import { FeedbackModalComponent } from './core/feedback/feedback.component';
import { FeedbackService } from './core/feedback/feedback.service';
import { FeedbackAudit } from './core/feedback/audit/feedback-audit.component';

@NgModule({
	imports: [
		CommonModule,
		BsDropdownModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		TooltipModule.forRoot(),

		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		HttpClientModule,

		AppRoutingModule,
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
	],
	declarations: [
		AppComponent,
		FeedbackAudit,
		FeedbackModalComponent,
		HeaderComponent,
		LoggedInComponent,
		InvalidResourceComponent,
		FooterComponent
	],
	entryComponents: [
		FeedbackAudit,
		FeedbackModalComponent
	],
	bootstrap: [ AppComponent ],
	providers: [
		AuthenticationService,
		AuthGuard,
		ConfigService,
		FeedbackService,
		SocketService,
		TeamsService,
		ToasterService,
		UserStateService
	]
})
export class AppModule { }
