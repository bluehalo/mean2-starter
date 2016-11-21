import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { ManageTeamComponent } from './manage-team.component';
import { ListTeamMembersComponent } from './list-team-members.component';
import { ListTeamsComponent } from './list-teams.component';
import { TeamSummaryComponent } from './team-summary.component';
import { UtilModule } from '../shared/util.module';
import { TagsModule } from './tags/tags.module';
import { TagsService } from './tags/tags.service';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
		RouterModule,
		TagsModule,
		UtilModule
	],
	entryComponents: [],
	exports: [],
	declarations: 	[
		ListTeamsComponent,
		ListTeamMembersComponent,
		ManageTeamComponent,
		TeamSummaryComponent
	],
	providers: [
		TagsService
	]
})
export class TeamsModule { }
