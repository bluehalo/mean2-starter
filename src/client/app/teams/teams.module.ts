import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { UtilModule } from 'app/shared';

import { TeamAudit, TeamRoleAudit } from './audit';
import { TagsService, TagsModule } from './tags';

import { ManageTeamComponent } from './manage-team.component';
import { ListTeamMembersComponent } from './list-team-members.component';
import { ListTeamsComponent } from './list-teams.component';
import { TeamSummaryComponent } from './team-summary.component';
import { TeamsRoutingModule } from './teams-routing.module';
import { SelectTeamsComponent } from './select-teams.component';

@NgModule({
	imports: [
		TeamsRoutingModule,
		TagsModule,

		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
		UtilModule
	],
	entryComponents: [
		TeamAudit,
		TeamRoleAudit
	],
	exports: [
		SelectTeamsComponent,
		TeamAudit,
		TeamRoleAudit
	],
	declarations: 	[
		ListTeamsComponent,
		ListTeamMembersComponent,
		ManageTeamComponent,
		SelectTeamsComponent,
		TeamAudit,
		TeamRoleAudit,
		TeamSummaryComponent
	],
	providers: [
		TagsService
	]
})
export class TeamsModule { }
