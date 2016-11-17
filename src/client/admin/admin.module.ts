import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { EuaService } from './eua.service';
import { UserEuaComponent } from './end-user-agreement/user-eua.component';
import { AdminService } from './admin.service';
import { AdminComponent } from './admin.component';
import { InvalidCertificateComponent } from './invalid-certificate.component';
import { InactiveComponent } from './inactive.component';
import { NoAccessComponent } from './no-access.component';
import { SigninComponent } from './signin.component';
import { UnauthorizedComponent } from './unauthorized.component';
import { AdminRoutingModule } from './admin-routes.module';
import { AdminUserModule } from './user-management/admin-user.module';
import { AdminEuaModule } from './end-user-agreement/admin-eua.module';
import { UtilModule } from '../shared/util.module';
import { AlertService } from '../shared/alert.service';

@NgModule({
	imports: [
		AdminRoutingModule,

		// App Admin Modules
		AdminEuaModule,
		AdminUserModule,

		CommonModule,
		FormsModule,
		RouterModule,
		Ng2BootstrapModule,
		UtilModule
	],
	exports: [],
	declarations:   [
		AdminComponent,
		InactiveComponent,
		InvalidCertificateComponent,
		NoAccessComponent,
		SigninComponent,
		UnauthorizedComponent,
		UserEuaComponent
	],
	providers:  [
		AlertService,
		AdminService,
		EuaService
	]
})
export class AdminModule { }
