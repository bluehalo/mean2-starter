import { Component, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';

@Component({
	selector: 'list-manager',
	templateUrl: './list-manager.component.html'
})

export class ListManager {

	@Input() delimiter: string = '"([^"]*)"|\'([^\']*)\'|([^\\s|,"]+)';

	@Input() placeholder: string = 'Enter a comma separated list of user accounts. This can be a mixture of user handles, user ids and user display names (ie. user1, @user2, 78934543, User 4)';

	@Input() rows: number = 2;

	@Input() disabled: boolean = false;

	@Input()
	get items(): string[] {
		return this._items;
	}
	set items(newValue: string[]) {
		this._items = newValue;
		if (_.isEmpty(this._items)) {
			this._itemsRaw = '';
		}
	}

	@Input()
	get itemsRaw(): string {
		return this._itemsRaw;
	}
	set itemsRaw(newValue: string) {
		if (newValue) {
			let split = new RegExp(this.delimiter, 'g');
			this._items = _.map(newValue.match(split), function(val) {
				if ((val.charAt(0) === '"' || val.charAt(0) === '\'') && (val.charAt(val.length - 1) === '"' || val.charAt(val.length - 1) === '\'')) {
					val = val.substring(1, val.length - 1);
				}
				return val;
			});
		} else {
			this._items = [];
		}
		this._itemsRaw = newValue;
		this.onChange.emit({queryArray: this._items});
	}

	@Output() onChange: EventEmitter<any> = new EventEmitter();

	_items: string[];

	_itemsRaw: string;

	constructor() {}

	generateRawItems() {
		let newItemsRaw = '';
		if (this._items) {
			newItemsRaw = this._items.map(function(item) {
				if (item.indexOf(' ') > -1) {
					item = '"' + item + '"';
				}
				return item;
			}).join(',');
		}
		this._itemsRaw = newItemsRaw;
	}

	ngOnInit() {
		this.generateRawItems();
	}

	deleteItem(item: string) {
		let newArr = this._items;
		newArr.splice(this._items.indexOf(item), 1);
		this._items = newArr.concat();
		this.generateRawItems();
		this.onChange.emit({ queryArray: this._items });
	}
}
