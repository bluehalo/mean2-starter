import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AlertModule, BsDropdownModule, TabsModule, TooltipModule, TypeaheadModule } from 'ngx-bootstrap';

import { ManageTeamComponent } from './manage-team.component';
import { ListTeamMembersComponent } from './list-team-members.component';
import { ListTeamsComponent } from './list-teams.component';
import { TeamSummaryComponent } from './team-summary.component';
import { UtilModule } from '../shared/util.module';
import { TagsModule } from './tags/tags.module';
import { TeamsRoutingModule } from './teams-routing.module';
import { TagsService } from './tags/tags.service';
import { TeamAudit } from './audit/team-audit.component';
import { TeamRoleAudit } from './audit/team-role-audit.component';
import { SelectTeamsComponent } from './select-teams.component';
import { JoinTeamComponent } from './join-team.component';
import { RequestNewTeamModalComponent } from './request-new-team.component';

@NgModule({
	imports: [
		AlertModule.forRoot(),
		BsDropdownModule.forRoot(),
		TabsModule.forRoot(),
		TooltipModule.forRoot(),
		TypeaheadModule.forRoot(),

		TeamsRoutingModule,
		TagsModule,

		CommonModule,
		FormsModule,
		UtilModule
	],
	entryComponents: [
		RequestNewTeamModalComponent,
		TeamAudit,
		TeamRoleAudit
	],
	exports: [
		SelectTeamsComponent,
		TeamAudit,
		TeamRoleAudit
	],
	declarations: 	[
		JoinTeamComponent,
		ListTeamsComponent,
		ListTeamMembersComponent,
		ManageTeamComponent,
		RequestNewTeamModalComponent,
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
