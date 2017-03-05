import { Component, Output, EventEmitter } from '@angular/core';

@Component({
	templateUrl: './overview.component.html'
})
export class OverviewHelpComponent {
	@Output() backEvent = new EventEmitter();

	back() {
		this.backEvent.emit({});
	}

}
