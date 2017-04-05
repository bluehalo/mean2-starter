import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AlertService, UtilModule } from 'app/shared';
import { CacheEntriesService } from 'app/access-checker';
import { TeamsModule } from 'app/teams';

import { UserService } from '../user';
import { UserAudit } from './audit/user-audit.component';
import { AdminService } from '../admin.service';
import { AdminCreateUserComponent } from './admin-create-user.component';
import { AdminUpdateUserComponent } from './admin-edit-user.component';
import { AdminListUsersComponent } from './admin-list-users.component';
import { ExportUsersModal } from './export-users.component';
import { UpdateUserComponent } from './edit-user.component';
import { UserSignupComponent } from './user-signup.component';

@NgModule({
imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
		RouterModule,
		TeamsModule,
		UtilModule
	],
	exports: [
		UserAudit
	],
	entryComponents: [
		ExportUsersModal,
		UserAudit
	],
	declarations:   [
		AdminCreateUserComponent,
		AdminUpdateUserComponent,
		AdminListUsersComponent,
		ExportUsersModal,
		UpdateUserComponent,
		UserAudit,
		UserSignupComponent
	],
	providers:  [
		AlertService,
		AdminService,
		CacheEntriesService,
		UserService
	],
})
export class AdminUserModule { }
