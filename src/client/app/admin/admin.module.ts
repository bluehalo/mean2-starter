import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { EuaService } from './end-user-agreement/eua.service';
import { AdminService } from './admin.service';
import { AdminComponent } from './admin.component';
import { AuthenticationModule } from './authentication/authentication.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminUserModule } from './user-management/admin-user.module';
import { AdminEuaModule } from './end-user-agreement/admin-eua.module';
import { UtilModule } from '../shared/util.module';
import { AlertService } from '../shared/alert.service';
import { AdminMessagesModule } from '../messages/admin/admin-messages.module';

@NgModule({
	imports: [
		AdminRoutingModule,

		// App Admin Modules
		AdminEuaModule,
		AdminMessagesModule,
		AdminUserModule,

		AuthenticationModule,

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
