import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
	selector: 'asy-add-remove-list',
	templateUrl: './add-remove-list.component.html'
})

export class AddRemoveList {

	@Input() items: string[] = [];

	@Input() buttonText: string = '';

	@Input() placeholder: string = '';

	@Input() readOnly: boolean = false;

	@Output() itemsChanged = new EventEmitter();

	protected item: string = '';

	constructor() {}

	protected isAddDisabled(): boolean {
		return (!this.item || this.item === '' || this.items.indexOf(this.item) >= 0);
	}

	protected addItem() {
		if (!this.isAddDisabled()) {
			this.items.push(this.item);
			this.item = '';

			this.itemsChanged.emit({items: this.items});
		}
	}


	protected deleteItem(index: number) {
		this.items.splice(index, 1);

		this.itemsChanged.emit({items: this.items});
	}

}
