import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subscription } from 'rxjs/Subscription';

import { EndUserAgreement } from './eua.class';
import { EuaService } from './eua.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { ManageEuaComponent } from './manage-eua.component';
import { AlertService } from '../../shared/alert.service';
import { ModalService } from '../../shared/asy-modal.service';

@Component({
	selector: 'admin-update-eua',
	templateUrl: 'manage-eua.component.html'
})
export class AdminUpdateEuaComponent extends ManageEuaComponent {

	private routeParamSubscription: Subscription;

	constructor(
		private euaService: EuaService,
		private route: ActivatedRoute,
		protected router: Router,
		protected auth: AuthenticationService,
		protected asyModalService: ModalService,
		public alertService: AlertService
	) {
		super(router, auth, asyModalService, alertService);
	}

	ngOnInit() {
		this.title = 'Edit EUA';
		this.subtitle = 'Make changes to the eua\'s information';
		this.submitText = 'Save';

		this.routeParamSubscription = this.route.params
			.do((params: Params) => this.id = params[`id`])
			.switchMap(() => this.euaService.get(this.id))
			.subscribe((eua: EndUserAgreement) => this.eua = eua);
	}

	ngOnDestroy() {
		this.routeParamSubscription.unsubscribe();
	}

	submitEua() {
		let _eua = new EndUserAgreement();
		_eua.euaModel = {
			_id: this.eua.euaModel._id,
			title: this.eua.euaModel.title,
			text: this.eua.euaModel.text,
			published: this.eua.euaModel.published
		};

		this.euaService.update(_eua).subscribe(
			() => this.router.navigate(['/admin/euas', {clearCachedFilter: true}]),
			(error: HttpErrorResponse) => this.alertService.addAlert(error.error.message));
	}
}
