import { Component } from '@angular/core';
import { EndUserAgreement } from './../../model/eua.client.class';
import { EuaService } from './../../services/eua.client.service';
import { AuthenticationService } from './../../services/authentication.client.service';
import { ManageEuaComponent } from './manage-eua.client.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Modal } from 'angular2-modal/plugins/bootstrap';
import { AlertService } from '../../../shared/services/alert.client.service';

@Component({
	selector: 'admin-update-eua',
	templateUrl: '../../views/eua/manage-eua.client.view.html'
})
export class AdminUpdateEuaComponent extends ManageEuaComponent {

	constructor(
		protected router: Router,
		protected auth: AuthenticationService,
		protected alertService: AlertService,
		protected euaService: EuaService,
		protected route: ActivatedRoute,
		protected modal: Modal
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
