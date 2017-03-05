import { Router } from '@angular/router';

import { Modal } from 'angular2-modal/plugins/bootstrap';

import { EndUserAgreement } from './eua.class';
import { AuthenticationService } from '../authentication/authentication.service';
import { AlertService } from '../../shared/alert.service';

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
		public router: Router,
		public auth: AuthenticationService,
		public alertService: AlertService,
		public modal: Modal
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
