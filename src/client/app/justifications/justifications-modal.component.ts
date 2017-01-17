'use strict';
import { Component, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
	selector: 'justificationsModal',
	templateUrl: 'justifications-modal.component.html'
})
export class JustificationsModalComponent {

	@Input() title: string;

	@Input() placeholder: string = 'Enter justification...';

	@Input() okText: string = 'Submit';

	@Input() cancelText: string = 'Cancel';

	@Input()
	get showModal() {
		return this.showModalValue;
	}
	set showModal(v: boolean) {
		this.showModalValue = v;
		this.showModalChange.emit(this.showModalValue);

		if (this.showModalValue) {
			this.modal.show();
		}
	}
	@Output() showModalChange = new EventEmitter<boolean>();

	@Output() userSubmit = new EventEmitter<boolean>();

	@ViewChild('fhJustificationsModal') private modal: ModalDirective;

	private showModalValue: boolean = false;

	private internalJustification: any;

	private error: string;

	constructor() {}


	ok() {
		if (null == this.internalJustification || this.internalJustification.trim().length === 0) {
			this.error = `Justification cannot be empty!`;
		}
		else {
			this.modal.hide();
			this.userSubmit.emit(this.internalJustification);
		}
	}

	cancel() {
		this.modal.hide();
	}

	onHidden() {
		this.showModal = false;
	}

	onShown() {

	}

	onJustificationChange(event: any) {
		this.internalJustification = event;
	}
}
