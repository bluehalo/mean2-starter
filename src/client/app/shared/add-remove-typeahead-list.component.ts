import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'asy-add-remove-typeahead-list',
	templateUrl: './add-remove-typeahead-list.component.html'
})
export class AddRemoveTypeaheadList {

	@Input() readOnly = false;

	@Input() items: any[] = [];

	@Input() placeholder: string = '';

	@Input() identifier: string = 'name';

	@Input() availableItems: any[] = [];

	@Output() itemsChanged = new EventEmitter();

	selectedItem: any;

	constructor() {}

	addItem() {
		this.items.push(this.selectedItem);
		this.selectedItem = null;

		this.itemsChanged.emit({items: this.items});
	}

	deleteItem(index: number) {
		this.items.splice(index, 1);

		this.itemsChanged.emit({items: this.items});
	}

	typeaheadOnSelect(e: any) {
		if (null != e) {
			this.selectedItem = e.item;
			this.addItem();
		}
	}

}
