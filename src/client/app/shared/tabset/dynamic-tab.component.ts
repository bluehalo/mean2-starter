import { Component, Input } from '@angular/core';
import { DynamicTabset } from './dynamic-tabset.component';

@Component({
	selector: 'dynamic-tab',
	templateUrl: './dynamic-tab.component.html'
})
export class DynamicTab {

	@Input() tabTitle: string;

	active: boolean = false;

	constructor(tabs: DynamicTabset) {
		tabs.addTab(this);
	}
}
