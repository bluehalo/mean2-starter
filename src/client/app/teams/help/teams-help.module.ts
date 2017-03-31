import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HelpService } from 'app/help/help.service';
import { HelpTopic } from 'app/help/help.class';
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
