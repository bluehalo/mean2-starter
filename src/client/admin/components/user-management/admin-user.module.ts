import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AdminService } from '../../services/admin.client.service';
import { AdminCreateUserComponent } from './admin-create-user.client.component';
import { AdminUpdateUserComponent } from './admin-edit-user.client.component';
import { AdminListUsersComponent } from '../admin-list-users.client.component';
import { ExportUsersModal } from '../export-users.client.component';
import { UpdateUserComponent } from './edit-user.client.component';
import { UserSignupComponent } from './user-signup.client.component';
import { UserService } from '../../services/users.client.service';
import { UtilModule } from '../../../shared/util.module';
import { AlertService } from '../../../shared/services/alert.client.service';
import { CacheEntriesService } from '../../../access-checker/services/cache-entries.client.service';

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
