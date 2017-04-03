import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ListAuditEntriesComponent } from './entries/list-audit-entries.component';
import { AuthGuard } from '../core/auth-guard.service';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: '',
				component: ListAuditEntriesComponent,
				pathMatch: 'full',
				canActivate: [ AuthGuard ],
				data: { roles: [ 'auditor' ] }
			}
		])
	],
	exports: [
		RouterModule
	]
})
export class AuditRoutingModule { }
