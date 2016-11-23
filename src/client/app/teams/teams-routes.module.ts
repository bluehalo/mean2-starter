import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { ListTeamsComponent } from './list-teams.component';
import { ManageTeamComponent } from './manage-team.component';
import { TeamSummaryComponent } from './team-summary.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'teams',
				component: ListTeamsComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			},
			{
				path: 'team/create',
				component: ManageTeamComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'editor' ] }
			},
			{
				path: 'team/edit/:id',
				component: ManageTeamComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			},
			{
				path: 'team/:id',
				component: TeamSummaryComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			}
		])
	],
	exports: [
	]
})
export class TeamsRoutingModule { }
