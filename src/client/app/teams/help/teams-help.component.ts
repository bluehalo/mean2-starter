import { Component, Output, EventEmitter } from '@angular/core';

@Component({
	templateUrl: './teams-help.component.html'
})
export class TeamsHelpComponent {
	@Output() backEvent = new EventEmitter();

	protected back() {
		this.backEvent.emit({});
	}

}
