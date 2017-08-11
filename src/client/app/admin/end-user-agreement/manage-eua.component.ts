import { Router } from '@angular/router';

import { EndUserAgreement } from './eua.class';
import { AuthenticationService } from '../authentication/authentication.service';
import { AlertService } from '../../shared/alert.service';
import { ModalService } from '../../shared/asy-modal.service';

export abstract class ManageEuaComponent {
	error: any;

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
		public asyModalService: ModalService
	) {
		this.eua = new EndUserAgreement();
	}

	abstract submitEua(): any;

	previewEua() {
		this.asyModalService.alert(this.eua.euaModel.title, this.eua.euaModel.text);
	}
}
