import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
	selector: 'template[asy-template]'
})
export class AsyTemplate {
	@Input('asy-template') type: string;

	constructor(public templateRef: TemplateRef<any>) { }
}
