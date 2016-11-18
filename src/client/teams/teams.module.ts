import { NgModule } from '@angular/core';

import { ManageTeamComponent } from './manage-team.component';
import { ListTeamMembersComponent } from './list-team-members.component';
import { ListTeamsComponent } from './list-teams.component';
import { TeamSummaryComponent } from './team-summary.component';

@NgModule({
	imports: [],
	entryComponents: [],
	exports: [],
	declarations: 	[
		ManageTeamComponent,
		ListTeamMembersComponent,
		ListTeamsComponent,
		TeamSummaryComponent
	],
	providers: [
	]
})
export class TeamsModule { }
