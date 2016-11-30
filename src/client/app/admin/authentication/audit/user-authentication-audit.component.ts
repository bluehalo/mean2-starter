import { Component } from '@angular/core';
import { AuditObjectTypes } from '../../../audit/audit.classes';
import {  DefaultAudit } from '../../../audit/audit-object.component';
@Component({
	selector: 'user-authentication',
	templateUrl: './user-authentication.audit.component.html'
})
export class UserAuthenticationAudit extends DefaultAudit {}
AuditObjectTypes.registerType('user-authentication', UserAuthenticationAudit);
