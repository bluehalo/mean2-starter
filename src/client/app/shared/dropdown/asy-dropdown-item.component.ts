import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'asy-dropdown-item',
	template: `<a *ngIf="show" (click)="onClick()">{{ label }}</a>`
})
export class AsyDropdownItemComponent {

	@Input() label: string;

	@Input() show: boolean = true;

	@Output() clicked = new EventEmitter();

	constructor(
	) {}

	onClick() {
		this.clicked.emit();
	}
}
