import { Component } from '@angular/core';

import { AuditObjectTypes, DefaultAudit } from 'app/audit';

@Component({
	selector: 'tag-audit',
	templateUrl: './tag-audit.component.html'
})
export class TagAudit extends DefaultAudit {}
AuditObjectTypes.registerType('tag', TagAudit);
