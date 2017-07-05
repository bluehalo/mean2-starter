import { Component } from '@angular/core';

import { AuditObjectTypes } from 'app/audit/audit.classes';
import { DefaultAudit } from 'app/audit';

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
