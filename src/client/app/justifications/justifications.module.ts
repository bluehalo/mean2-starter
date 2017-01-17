import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { JustificationsService } from './justifications.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';

import { JustificationsModalComponent } from './justifications-modal.component';
import { JustificationsTypeaheadComponent } from './justifications-typeahead.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
	],
	exports: [
		JustificationsModalComponent,
		JustificationsTypeaheadComponent,
	],
	declarations: [
		JustificationsModalComponent,
		JustificationsTypeaheadComponent,
	],
	providers: [
		JustificationsService,
		AuthenticationService,
	]
})
export class JustificationsModule { }
