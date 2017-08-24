import { Component } from '@angular/core';

import { DefaultAudit } from '../../../audit/audit-object.component';
import { AuditObjectTypes } from '../../../audit/audit.classes';

@Component({
	selector: 'feedback-audit',
	template: `
			<span *ngIf='auditObject'>
				<i class='fa fa-comments'></i> Feedback submitted
			</span>
			`
})
export class FeedbackAudit extends DefaultAudit {}
AuditObjectTypes.registerType('feedback', FeedbackAudit);
