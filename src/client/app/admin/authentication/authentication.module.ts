import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminService } from '../admin.service';
import { UserService } from '../users.service';
import { UtilModule } from '../../shared/util.module';
import { AlertService } from '../../shared/alert.service';
import { NoAccessComponent } from './no-access.component';
import { InvalidCertificateComponent } from './invalid-certificate.component';
import { InactiveComponent } from './inactive.component';
import { SigninComponent } from './signin.component';
import { UnauthorizedComponent } from './unauthorized.component';
import { UserAuthenticationAudit } from './audit/user-authentication-audit.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		UtilModule
	],
	exports: [
		UserAuthenticationAudit
	],
	entryComponents: [
		UserAuthenticationAudit
	],
	declarations:   [
		NoAccessComponent,
		InactiveComponent,
		InvalidCertificateComponent,
		SigninComponent,
		UserAuthenticationAudit,
		UnauthorizedComponent,
	],
	providers:  [
		AlertService,
		AdminService,
		UserService
	],
})
export class AuthenticationModule { }
