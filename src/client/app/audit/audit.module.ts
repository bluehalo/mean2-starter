import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { BootstrapModalModule, Modal } from 'angular2-modal/plugins/bootstrap';

import { AuditRoutingModule } from './audit-routing.module';
import { AuditService } from './audit.service';
import { AuditViewChangeModal, AuditViewDetailModal } from './entries/audit-view-change.component';
import { AuditObjectComponent, UrlAudit, DefaultAudit, ExportAudit } from './entries/audit-object.component';
import { ListAuditEntriesComponent } from './entries/list-audit-entries.component';
import { UtilModule } from '../shared/util.module';
import { UserService } from '../admin/users.service';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
		UtilModule,
		AuditRoutingModule
	],
	entryComponents: [
		AuditViewChangeModal,
		AuditViewDetailModal,

		DefaultAudit,
		ExportAudit
	],
	exports: [],
	declarations: [
		ListAuditEntriesComponent,
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
