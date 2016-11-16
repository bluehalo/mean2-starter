import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Modal } from 'angular2-modal/plugins/bootstrap';

import { EndUserAgreement } from './../../model/eua.client.class';
import { EuaService } from './../../services/eua.client.service';
import { AuthenticationService } from './../../services/authentication.client.service';
import { ManageEuaComponent } from './manage-eua.client.component';
import { AlertService } from '../../../shared/services/alert.client.service';

@Component({
	selector: 'admin-create-eua',
	templateUrl: '../../views/eua/manage-eua.client.view.html'
})
export class AdminCreateEuaComponent extends ManageEuaComponent {

	constructor(
		router: Router,
		auth: AuthenticationService,
		alertService: AlertService,
		private euaService: EuaService,
		protected modal: Modal

	) {
		super(router, auth, alertService, modal);
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
