import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { BootstrapModalModule, Modal } from 'angular2-modal/plugins/bootstrap';

import { AuditViewChangeModal, AuditViewDetailModal } from './components/audit-view-change.client.component';
import { AuditService } from './services/audit.client.service';
import { AuditComponent } from './components/audit.client.component';
import { AuditObjectComponent, UrlAudit, UserAuthenticationAudit, UserAudit } from './components/audit-object.client.component';
import { UtilModule } from '../shared/util.module';
import { UserService } from '../admin/users.service';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
		UtilModule
	],
	entryComponents: [
		AuditViewChangeModal,
		AuditViewDetailModal
	],
	exports: [],
	declarations: 	[
		AuditComponent,
		AuditObjectComponent,
		AuditViewChangeModal,
		AuditViewDetailModal,
		UrlAudit,
		UserAuthenticationAudit,
		UserAudit,
		AuditObjectComponent
	],
	providers: [
		AuditService,
		BootstrapModalModule,
		Modal,
		UserService
	]
})
export class AuditModule { }
