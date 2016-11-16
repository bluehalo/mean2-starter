import { Injectable, ModuleWithProviders } from '@angular/core';
import { HelpTopic } from './model/help.classes';

@Injectable()
export class HelpService {
	public helpRegistry: HelpTopic[] = [];

	public registerHelpComponent(helpTopic: HelpTopic) {
		this.helpRegistry.push(helpTopic);
	}

	public getTopics(): HelpTopic[] {
		return this.helpRegistry;
	}
}
