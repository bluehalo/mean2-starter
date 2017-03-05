import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'confirm-modal',
	templateUrl: './confirm.component.html'
})

export class ConfirmModal {

	@Input() title: string;
	@Input() message: string;
	@Input() isVisible: boolean = false;
	@Input() cancelText: string = 'Cancel';
	@Input() okText: string = 'OK';

	@Output() onClose: EventEmitter<any> = new EventEmitter();

	showModal: boolean = false;

	constructor() {}

	ok() {
		this.showModal = false;
		this.onClose.emit({
			// action: ModalAction.OK
		});
		return false;
	}

	cancel() {
		this.showModal = false;
		this.onClose.emit({
			// action: ModalAction.CANCEL
		});
		return false;
	}
}
