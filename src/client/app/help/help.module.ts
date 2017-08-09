import { NgModule, ApplicationModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HelpComponent } from './help.component';
import { HelpRoutingModule } from './help-routing.module';
import { UtilModule } from '../shared/util.module';
import { CoreHelpModule } from '../core/help/core-help.module';
import { CoreHelpRoutingModule } from '../core/help/core-help-routing.module';
import { TeamsHelpModule } from '../teams/help/teams-help.module';
import { TeamsHelpRoutingModule } from '../teams/help/teams-help-routing.module';
import { HelpService } from './help.service';

@NgModule({
	imports: [
		ApplicationModule,

		CoreHelpModule,
		CoreHelpRoutingModule,

		HelpRoutingModule,

		TeamsHelpModule,
		TeamsHelpRoutingModule,

		CommonModule,
		FormsModule,
		RouterModule,
		UtilModule
	],
	exports: [],
	declarations:   [
		HelpComponent
	],
	providers:  [
		HelpService
	]
})
export class HelpModule { }
