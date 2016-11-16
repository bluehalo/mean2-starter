import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { EuaService } from './services/eua.client.service';
import { UserEuaComponent } from './components/end-user-agreement/user-eua.client.component';
import { AdminService } from './services/admin.client.service';
import { AdminComponent } from './components/admin.client.component';
import { InvalidCertificateComponent } from './components/invalid-certificate.client.component';
import { InactiveComponent } from './components/inactive.client.component';
import { NoAccessComponent } from './components/no-access.client.component';
import { SigninComponent } from './components/signin.client.component';
import { UnauthorizedComponent } from './components/unauthorized.client.component';
import { AdminRoutingModule } from './admin-routes.module';
import { AdminUserModule } from './components/user-management/admin-user.module';
import { AdminEuaModule } from './components/end-user-agreement/admin-eua.module';
import { UtilModule } from '../shared/util.module';
import { AlertService } from '../shared/services/alert.client.service';

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
