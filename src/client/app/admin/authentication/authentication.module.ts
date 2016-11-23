import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AdminService } from '../admin.service';
import { UserService } from '../users.service';
import { UtilModule } from '../../shared/util.module';
import { AlertService } from '../../shared/alert.service';
import { NoAccessComponent } from './no-access.component';
import { InvalidCertificateComponent } from './invalid-certificate.component';
import { InactiveComponent } from './inactive.component';
import { SigninComponent } from './signin.component';
import { UnauthorizedComponent } from './unauthorized.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
		RouterModule,
		UtilModule
	],
	exports: [],
	declarations:   [
		NoAccessComponent,
		InactiveComponent,
		InvalidCertificateComponent,
		SigninComponent,
		UnauthorizedComponent,
	],
	providers:  [
		AlertService,
		AdminService,
		UserService
	],
})
export class AuthenticationModule { }
