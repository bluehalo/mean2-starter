import { Router } from '@angular/router';

import { Modal } from 'angular2-modal/plugins/bootstrap';

import { AlertService } from 'app/shared';
import { AuthenticationService } from '../authentication';

import { EndUserAgreement } from './eua.class';

export abstract class ManageEuaComponent {
public error: any;

	mode: string;
	id: string;
	eua: EndUserAgreement;
	preview: boolean;
	title: string;
	subtitle: string;
	submitText: string;

	constructor(
		protected router: Router,
		protected auth: AuthenticationService,
		protected alertService: AlertService,
		protected modal: Modal
	) {
		this.eua = new EndUserAgreement();
	}

	abstract submitEua(): any;

	previewEua() {
		return this.modal.alert()
			.size('lg')
			.showClose(true)
			.title(this.eua.euaModel.title)
			.body(this.eua.euaModel.text)
			.open();
	}
}
