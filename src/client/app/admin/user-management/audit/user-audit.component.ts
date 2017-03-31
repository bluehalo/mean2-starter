import { Component } from '@angular/core';

import { AuditObjectTypes } from 'app/audit/audit.classes';
import { DefaultAudit } from 'app/audit';

@Component({
	selector: 'user',
	templateUrl: './user-audit.component.html'
})
export class UserAudit extends DefaultAudit {}

AuditObjectTypes.registerType('user', UserAudit);
