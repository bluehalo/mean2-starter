import { Component } from '@angular/core';
import { DefaultAudit } from '../audit/audit-object.component';
import { AuditObjectTypes } from '../audit/audit.classes';

@Component({
	selector: 'export-audit',
	template: `
			<span *ngIf='auditObject'>
				<i class='fa fa-download'></i> Export config
			</span>
			`
})
export class ExportAudit extends DefaultAudit {}
AuditObjectTypes.registerType('export', ExportAudit);
