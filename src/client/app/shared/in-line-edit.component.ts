import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, forwardRef, Input, Output, OnInit, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';

import * as _ from 'lodash';

const INLINE_EDIT_CONTROL_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => InLineEdit),
	multi: true
};

@Component({
	selector: 'asy-in-line-edit',
	providers: [INLINE_EDIT_CONTROL_VALUE_ACCESSOR],
	templateUrl: './in-line-edit.component.html'
})
export class InLineEdit implements ControlValueAccessor, OnInit {

	@ViewChild('inlineEditControl', {read: ViewContainerRef}) inlineEditControl: any;

	@Input() name: string = '';
	@Output() onSave = new EventEmitter();

	onChange: any = Function.prototype;
	onTouched: any = Function.prototype;

	editing: boolean = false;

	private _value: string = '';
	private preValue: string = '';

	constructor() {}

	ngOnInit() {}

	get value(): any {
		return this._value;
	}

	set value(v: any) {
		if (v !== this._value) {
			this._value = v;
			this.onChange(v);
		}
	}

	// Required for ControlValueAccessor interface
	writeValue(value: any) {
		this._value = value;
	}

	// Required forControlValueAccessor interface
	registerOnChange(fn: () => {}): void { this.onChange = fn; }

	// Required forControlValueAccessor interface
	registerOnTouched(fn: () => {}): void { this.onTouched = fn; }

	edit(value: any) {
		this.preValue = value;
		this.editing = true;
	}

	onSubmit(value: any) {
		let submitVal = value;
		if (_.isString(this.name) && this.name.trim().length > 0) {
			submitVal = {};
			submitVal[this.name] = value;
		}

		this.onSave.emit(submitVal);
		this.editing = false;
	}

	cancel(value: any) {
		this._value = this.preValue;
		this.editing = false;
	}
}
