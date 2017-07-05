import { Component } from '@angular/core';

import { AuditObjectTypes, DefaultAudit } from 'app/audit';

@Component({
	selector: 'team-role-audit',
	templateUrl: './team-role-audit.component.html'
})
export class TeamRoleAudit extends DefaultAudit {}
AuditObjectTypes.registerType('team-role', TeamRoleAudit);
