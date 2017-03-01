import { Component } from '@angular/core';
import { DynamicTab } from './dynamic-tab.component';

@Component({
	selector: 'dynamic-tabset',
	templateUrl: './dynamic-tabset.component.html'
})
export class DynamicTabset {
	tabs: DynamicTab[] = [];

	selectTab(selectedTab: DynamicTab) {
		this.tabs.forEach((tab: DynamicTab) => {
			tab.active = false;
		});
		selectedTab.active = true;
	}

	addTab(newTab: DynamicTab) {
		if (this.tabs.length === 0) {
			newTab.active = true;
		}
		this.tabs.push(newTab);
	}
}
