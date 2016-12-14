import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { ForgotPasswordComponent } from './forgot-password.component';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordSuccessComponent } from './reset-password-success.component';
import { PasswordRoutingModule } from './password-routing.module';

@NgModule({
	imports: [
		CommonModule,
		Ng2BootstrapModule,
		PasswordRoutingModule
	],
	exports: [],
	declarations:   [
		ForgotPasswordComponent,
		ResetPasswordComponent,
		ResetPasswordSuccessComponent
	],
	providers:  [
	]
})
export class PasswordModule { }
