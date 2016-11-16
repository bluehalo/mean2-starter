import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AdminService } from '../../services/admin.client.service';
import { AdminListEuasComponent } from './admin-list-euas.client.component';
import { AdminCreateEuaComponent } from './admin-create-eua.client.component';
import { AdminUpdateEuaComponent } from './admin-edit-eua.client.component';
import { BootstrapModalModule, Modal } from 'angular2-modal/plugins/bootstrap';
import { UtilModule } from '../../../shared/util.module';
import { AlertService } from '../../../shared/services/alert.client.service';

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
		AdminListEuasComponent,
		AdminCreateEuaComponent,
		AdminUpdateEuaComponent
	],
	providers:  [
		AlertService,
		AdminService,
		BootstrapModalModule,
		Modal
	],
})
export class AdminEuaModule { }
