import { NgModule } from '@angular/core';
import { OverviewHelpComponent } from './overview.client.component';
import { AboutComponent } from '../../help/components/help.client.component';
import { HelpService } from '../../help/help.service';
import { HelpTopic } from '../../help/model/help.classes';

@NgModule({
	imports: [],
	exports: [],
	declarations:   [
		AboutComponent,
		OverviewHelpComponent
	],
	providers:  []
})
export class CoreHelpModule {
	constructor(private helpService: HelpService) {
		this.helpService.registerHelpComponent(new HelpTopic('Getting Started', 'overview', 'core'));
	}
}
