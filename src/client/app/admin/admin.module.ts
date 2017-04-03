import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AlertService, UtilModule } from 'app/shared';
import { AdminMessagesModule } from 'app/messages';

import { EuaService } from './end-user-agreement';
import { AuthenticationModule } from './authentication';
import { AdminUserModule } from './user-management';
import { AdminEuaModule } from './end-user-agreement';
import { PasswordModule } from './password';

import { AdminService } from './admin.service';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
	imports: [
		AdminRoutingModule,

		// App Admin Modules
		AdminEuaModule,
		AdminMessagesModule,
		AdminUserModule,

		AuthenticationModule,
		PasswordModule,

		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
		UtilModule
	],
	exports: [],
	declarations:   [
		AdminComponent
	],
	providers:  [
		AlertService,
		AdminService,
		EuaService
	]
})
export class AdminModule { }
