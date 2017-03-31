import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { ManageTeamComponent } from './manage-team.component';
import { ListTeamMembersComponent } from './list-team-members.component';
import { ListTeamsComponent } from './list-teams.component';
import { TeamSummaryComponent } from './team-summary.component';
import { UtilModule } from 'app/shared/util.module';
import { TagsModule } from './tags/tags.module';
import { TeamsRoutingModule } from './teams-routing.module';
import { TagsService } from './tags/tags.service';
import { TeamAudit } from './audit/team-audit.component';
import { TeamRoleAudit } from './audit/team-role-audit.component';
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
