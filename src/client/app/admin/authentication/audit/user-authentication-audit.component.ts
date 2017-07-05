import { Component } from '@angular/core';

import { DefaultAudit } from 'app/audit';

import { AuditObjectTypes } from 'app/audit/audit.classes';

@Component({
	selector: 'user-authentication',
	templateUrl: './user-authentication-audit.component.html'
})
export class UserAuthenticationAudit extends DefaultAudit {}
AuditObjectTypes.registerType('user-authentication', UserAuthenticationAudit);
