import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HelpService } from '../../help/help.service';
import { HelpTopic } from '../../help/help.class';
import { TeamsHelpComponent } from './teams-help.component';

@NgModule({
	imports: [
		RouterModule
	],
	exports: [],
	declarations:   [
		TeamsHelpComponent
	],
	providers:  []
})
export class TeamsHelpModule {
	constructor(private helpService: HelpService) {
		this.helpService.registerHelpComponent(new HelpTopic('Teams', 'teams', 'teams'));
	}
}
