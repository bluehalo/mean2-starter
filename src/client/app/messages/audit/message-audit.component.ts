import { AuditObjectTypes } from 'app/audit/audit.classes';
import { DefaultAudit } from 'app/audit/audit-object.component';
import { Component } from '@angular/core';

@Component({
	selector: 'message-audit',
	template: `
			<span *ngIf='auditObject'>
				<i class='fa fa-envelope-o'></i> {{auditObject?.title}} ({{auditObject?.type}})
			</span>
			`
})
export class MessageAudit extends DefaultAudit {}
AuditObjectTypes.registerType('message', MessageAudit);
