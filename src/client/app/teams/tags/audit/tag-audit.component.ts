import { Component } from '@angular/core';

import { AuditObjectTypes } from '../../../audit/entries/audit.classes';
import { DefaultAudit } from '../../../audit/entries/audit-object.component';

@Component({
	selector: 'tag-audit',
	templateUrl: './tag-audit.component.html'
})
export class TagAudit extends DefaultAudit {}
AuditObjectTypes.registerType('tag', TagAudit);
