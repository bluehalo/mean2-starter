import { Component } from '@angular/core';

import { AuditObjectTypes } from 'app/audit/audit.classes';
import { DefaultAudit } from 'app/audit/audit-object.component';

@Component({
	selector: 'team-role-audit',
	templateUrl: './team-role-audit.component.html'
})
export class TeamRoleAudit extends DefaultAudit {}
AuditObjectTypes.registerType('team-role', TeamRoleAudit);
