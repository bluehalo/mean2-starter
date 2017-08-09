import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { DatepickerModule, TypeaheadModule } from 'ngx-bootstrap';
import { BootstrapModalModule, Modal } from 'angular2-modal/plugins/bootstrap';

import { AuditViewChangeModal, AuditViewDetailModal } from './audit-view-change.component';
import { AuditService } from './audit.service';
import { AuditComponent } from './audit.component';
import {
	AuditObjectComponent, UrlAudit,
	DefaultAudit, ExportAudit
} from './audit-object.component';
import { UtilModule } from '../shared/util.module';
import { UserService } from '../admin/users.service';

@NgModule({
	imports: [
		DatepickerModule.forRoot(),
		TypeaheadModule.forRoot(),

		CommonModule,
		FormsModule,
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
