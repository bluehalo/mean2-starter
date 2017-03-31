import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { BootstrapModalModule, Modal } from 'angular2-modal/plugins/bootstrap';

import { AuditViewChangeModal, AuditViewDetailModal } from './audit-view-change.component';
import { AuditService } from './audit.service';
import { AuditComponent } from './audit.component';
import {
	AuditObjectComponent, UrlAudit,
	DefaultAudit, ExportAudit
} from './audit-object.component';
import { UtilModule } from 'app/shared/util.module';
import { UserService } from 'app/admin/users.service';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
		UtilModule
	],
	entryComponents: [
		AuditViewChangeModal,
		AuditViewDetailModal,

		DefaultAudit,
		ExportAudit
	],
	exports: [],
	declarations: [
		AuditComponent,
		AuditObjectComponent,
		AuditViewChangeModal,
		AuditViewDetailModal,
		UrlAudit,
		AuditObjectComponent,

		DefaultAudit,
		ExportAudit
	],
	providers: [
		AuditService,
		BootstrapModalModule,
		Modal,
		UserService
	]
})
export class AuditModule { }
