import { Component } from '@angular/core';

import { AuditObjectTypes } from '../../audit/entries/audit.classes';
import { DefaultAudit } from '../../audit/entries/audit-object.component';

@Component({
	selector: 'team-role-audit',
	templateUrl: './team-role-audit.component.html'
})
export class TeamRoleAudit extends DefaultAudit {}
AuditObjectTypes.registerType('team-role', TeamRoleAudit);
