import { Injectable } from '@angular/core';

import { HelpTopic } from './help.class';

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
