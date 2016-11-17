import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Modal } from 'angular2-modal/plugins/bootstrap';

import { EndUserAgreement } from './eua.class';
import { EuaService } from './eua.service';
import { AuthenticationService } from '../authentication.service';
import { ManageEuaComponent } from './manage-eua.component';
import { AlertService } from '../../shared/alert.service';

@Component({
	selector: 'admin-create-eua',
	templateUrl: './manage-eua.component.html'
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
