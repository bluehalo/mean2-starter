import { AuditObjectTypes } from '../../../audit/entries/audit.classes';
import { DefaultAudit } from '../../../audit/entries/audit-object.component';
import { Component } from '@angular/core';

@Component({
	selector: 'user',
	templateUrl: './user-audit.component.html'
})
export class UserAudit extends DefaultAudit {}
AuditObjectTypes.registerType('user', UserAudit);
