import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ForgotPasswordComponent } from './forgot-password.component';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordSuccessComponent } from './reset-password-success.component';
import { PasswordRoutingModule } from './password-routing.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
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
