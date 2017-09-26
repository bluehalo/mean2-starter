import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AlertModule, ModalModule } from 'ngx-bootstrap';

import { AdminService } from '../admin.service';
import { AdminListEuasComponent } from './admin-list-euas.component';
import { AdminCreateEuaComponent } from './admin-create-eua.component';
import { AdminUpdateEuaComponent } from './admin-edit-eua.component';
import { UserEuaComponent } from './user-eua.component';
import { UtilModule } from '../../shared/util.module';
import { AlertService } from '../../shared/alert.service';
import { EuaAudit } from './audit/eua-audit.component';

@NgModule({
	imports: [
		AlertModule.forRoot(),
		ModalModule.forRoot(),

		CommonModule,
		FormsModule,
		RouterModule,
		UtilModule
	],
	exports: [
		EuaAudit
	],
	entryComponents: [
		EuaAudit
	],
	declarations:   [
		AdminListEuasComponent,
		AdminCreateEuaComponent,
		AdminUpdateEuaComponent,
		EuaAudit,
		UserEuaComponent
	],
	providers:  [
		AlertService,
		AdminService
	]
})
export class AdminEuaModule { }
