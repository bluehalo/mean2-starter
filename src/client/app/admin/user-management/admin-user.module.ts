import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AdminService } from '../admin.service';
import { AdminCreateUserComponent } from './admin-create-user.component';
import { AdminUpdateUserComponent } from './admin-edit-user.component';
import { AdminListUsersComponent } from './admin-list-users.component';
import { ExportUsersModal } from './export-users.component';
import { UpdateUserComponent } from './edit-user.component';
import { UserSignupComponent } from './user-signup.component';
import { UserService } from '../users.service';
import { UtilModule } from '../../shared/util.module';
import { AlertService } from '../../shared/alert.service';
import { CacheEntriesService } from '../../access-checker/cache-entries.service';
import { UserAudit } from './audit/user-audit.component';
import { TeamsModule } from '../../teams/teams.module';
import { UserSignedUpComponent } from './user-signed-up.component';

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
		UserSignupComponent,
		UserSignedUpComponent
	],
	providers:  [
		AlertService,
		AdminService,
		CacheEntriesService,
		UserService
	],
})
export class AdminUserModule { }
