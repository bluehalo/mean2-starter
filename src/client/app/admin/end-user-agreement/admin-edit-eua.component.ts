import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Modal } from 'angular2-modal/plugins/bootstrap';

import { EndUserAgreement } from './eua.class';
import { EuaService } from './eua.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { ManageEuaComponent } from './manage-eua.component';
import { AlertService } from '../../shared/alert.service';

@Component({
	selector: 'admin-update-eua',
	templateUrl: './manage-eua.component.html'
})
export class AdminUpdateEuaComponent extends ManageEuaComponent {

	constructor(
		public router: Router,
		public auth: AuthenticationService,
		public alertService: AlertService,
		public euaService: EuaService,
		public route: ActivatedRoute,
		public modal: Modal
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
