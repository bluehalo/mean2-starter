import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { EndUserAgreement } from './eua.class';
import { EuaService } from './eua.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { ManageEuaComponent } from './manage-eua.component';
import { AlertService } from '../../shared/alert.service';
import { ModalService } from '../../shared/asy-modal.service';

@Component({
	selector: 'admin-create-eua',
	templateUrl: './manage-eua.component.html'
})
export class AdminCreateEuaComponent extends ManageEuaComponent {

	constructor(
		router: Router,
		auth: AuthenticationService,
		alertService: AlertService,
		public asyModalService: ModalService,
		protected euaService: EuaService

	) {
		super(router, auth, alertService, asyModalService);
	}

	ngOnInit() {
		// Admin create mode
		this.title = 'Create EUA';
		this.subtitle = 'Provide the required information to create a new eua';
		this.submitText = 'Create';
	}

	submitEua() {
		let _eua = new EndUserAgreement();
		_eua.euaModel = {
			title: this.eua.euaModel.title,
			text: this.eua.euaModel.text
		};
		this.euaService.create(_eua).subscribe(() => this.router.navigate(['/admin/euas', {clearCachedFilter: true}]));
	}
}
