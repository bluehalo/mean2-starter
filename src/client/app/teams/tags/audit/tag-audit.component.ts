import { Component } from '@angular/core';

import { AuditObjectTypes } from '../../../audit/audit.classes';
import { DefaultAudit } from '../../../audit/audit-object.component';

@Component({
	selector: 'tag-audit',
	templateUrl: './tag-audit.component.html'
})
export class TagAudit extends DefaultAudit {}
AuditObjectTypes.registerType('tag', TagAudit);
