import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Modal } from 'angular2-modal/plugins/bootstrap';

import { EndUserAgreement } from './eua.class';
import { AuthenticationService } from '../authentication';
import { AlertService } from 'app/shared';

import { EuaService } from './eua.service';
import { ManageEuaComponent } from './manage-eua.component';

@Component({
	selector: 'admin-update-eua',
	templateUrl: './manage-eua.component.html'
})
export class AdminUpdateEuaComponent extends ManageEuaComponent {

	constructor(
		router: Router,
		auth: AuthenticationService,
		alertService: AlertService,
		modal: Modal,
		protected euaService: EuaService,
		protected route: ActivatedRoute
	) {
		super(router, auth, alertService, modal);
	}

	ngOnInit() {
		this.title = 'Edit EUA';
		this.subtitle = 'Make changes to the eua\'s information';
		this.submitText = 'Save';

		this.route.params.subscribe((params: Params) => {
			this.id = params[`id`];
			this.euaService.get(this.id).subscribe((euaRaw: any) => {
				this.eua = new EndUserAgreement().setFromEuaModel(euaRaw);
			});
		});
	}

	submitEua() {
		let _eua = new EndUserAgreement();
		_eua.euaModel = {
			_id: this.eua.euaModel._id,
			title: this.eua.euaModel.title,
			text: this.eua.euaModel.text,
			published: this.eua.euaModel.published
		};
		this.euaService.update(_eua).subscribe(() => this.router.navigate(['/admin/euas', {clearCachedFilter: true}]));
	}
}
