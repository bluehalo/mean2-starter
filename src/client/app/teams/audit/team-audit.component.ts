import { Component } from '@angular/core';

import { AuditObjectTypes } from '../../audit/audit.classes';
import { DefaultAudit } from '../../audit/audit-object.component';

@Component({
	selector: 'team-audit',
	templateUrl: './team-audit.component.html'
})
export class TeamAudit extends DefaultAudit {}
AuditObjectTypes.registerType('team', TeamAudit);
