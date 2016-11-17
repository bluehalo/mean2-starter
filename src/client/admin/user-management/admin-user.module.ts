import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AdminService } from '../admin.service';
import { AdminCreateUserComponent } from './admin-create-user.component';
import { AdminUpdateUserComponent } from './admin-edit-user.component';
import { AdminListUsersComponent } from '../admin-list-users.component';
import { ExportUsersModal } from '../export-users.component';
import { UpdateUserComponent } from './edit-user.component';
import { UserSignupComponent } from './user-signup.component';
import { UserService } from '../users.service';
import { UtilModule } from '../../shared/util.module';
import { AlertService } from '../../shared/alert.service';
import { CacheEntriesService } from '../../access-checker/cache-entries.service';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		Ng2BootstrapModule,
		UtilModule
	],
	exports: [],
	declarations:   [
		AdminCreateUserComponent,
		AdminUpdateUserComponent,
		AdminListUsersComponent,
		ExportUsersModal,
		UpdateUserComponent,
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
