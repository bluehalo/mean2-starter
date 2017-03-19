import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ListCacheEntriesComponent } from './entries/list-cache-entries.component';
import { AuthGuard } from '../core/auth-guard.service';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: '',
				component: ListCacheEntriesComponent,
				pathMatch: 'full',
				canActivate: [ AuthGuard ],
				data: { roles: [ 'admin' ] }
			}
		])
	],
	exports: [
		RouterModule
	]
})
export class AccessCheckerRoutingModule { }
