import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BootstrapModalModule, Modal } from 'angular2-modal/plugins/bootstrap';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AdminService } from '../admin.service';
import { AdminListEuasComponent } from './admin-list-euas.component';
import { AdminCreateEuaComponent } from './admin-create-eua.component';
import { AdminUpdateEuaComponent } from './admin-edit-eua.component';
import { UserEuaComponent } from './user-eua.component';
import { UtilModule } from '../../shared/util.module';
import { AlertService } from '../../shared/alert.service';

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
		AdminListEuasComponent,
		AdminCreateEuaComponent,
		AdminUpdateEuaComponent,
		UserEuaComponent
	],
	providers:  [
		AlertService,
		AdminService,
		BootstrapModalModule,
		Modal
	],
})
export class AdminEuaModule { }
