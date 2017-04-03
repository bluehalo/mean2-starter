import { Component } from '@angular/core';

import { AuditObjectTypes, DefaultAudit } from 'app/audit';

@Component({
	selector: 'team-audit',
	templateUrl: './team-audit.component.html'
})
export class TeamAudit extends DefaultAudit {}
AuditObjectTypes.registerType('team', TeamAudit);
