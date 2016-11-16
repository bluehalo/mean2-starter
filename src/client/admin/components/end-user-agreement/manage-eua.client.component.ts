import { Router } from '@angular/router';

import { EndUserAgreement } from './../../model/eua.client.class';
import { AuthenticationService } from './../../services/authentication.client.service';
import { Modal } from 'angular2-modal/plugins/bootstrap';
import { AlertService } from '../../../shared/services/alert.client.service';

export abstract class ManageEuaComponent {
	public error: any;

	protected mode: string;
	protected id: string;
	protected eua: EndUserAgreement;
	protected preview: boolean;
	protected title: string;
	protected subtitle: string;
	protected submitText: string;

	constructor(
		protected router: Router,
		protected auth: AuthenticationService,
		protected alertService: AlertService,
		protected modal: Modal
	) {
		this.eua = new EndUserAgreement();
	}

	protected abstract submitEua(): any;

	protected previewEua() {
		return this.modal.alert()
			.size('lg')
			.showClose(true)
			.title(this.eua.euaModel.title)
			.body(this.eua.euaModel.text)
			.open();
	}
}
