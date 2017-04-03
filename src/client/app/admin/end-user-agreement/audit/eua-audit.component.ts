import { AuditObjectTypes } from '../../../audit/entries/audit.classes';
import { DefaultAudit } from '../../../audit/entries/audit-object.component';
import { Component } from '@angular/core';

@Component({
	selector: 'eua-audit',
	template: `
			<span *ngIf='auditObject'>
				<i class='fa fa-search'></i> {{auditObject?.title}}
			</span>
			`
})
export class EuaAudit extends DefaultAudit {}
AuditObjectTypes.registerType('eua', EuaAudit);
