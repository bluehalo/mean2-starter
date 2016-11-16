import * as types from '../components/audit-object.client.component';

export class AuditOption {
	constructor(
		public display?: string,
		public selected: boolean = false
	) {}
}

export class AuditObjectTypes {
	public static objects: any = {
		'eua': types.EuaAudit,
		'url': types.UrlAudit,
		'user-authentication': types.UserAuthenticationAudit,
		'user': types.UserAudit,
		'message': types.MessageAudit
	};
}
