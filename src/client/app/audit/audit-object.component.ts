import {
	Component, Input, ViewChild, ViewContainerRef, ComponentRef, ComponentFactoryResolver,
	ComponentFactory
} from '@angular/core';
import { AuditObjectTypes } from './audit.classes';

export let auditObjects: any[] = [];

@Component({
	selector: 'default',
	templateUrl: './templates/default.audit.view.html'
})
export class DefaultAudit {
	@Input() auditObject: any = {};
}
auditObjects.push(DefaultAudit);
AuditObjectTypes.registerType('default', DefaultAudit);

@Component({
	selector: 'url',
	templateUrl: './templates/url.audit.view.html'
})
export class UrlAudit extends DefaultAudit {}
auditObjects.push(UrlAudit);
AuditObjectTypes.registerType('url', UrlAudit);

@Component({
	selector: 'asy-audit-component',
	template: '<div #content></div>'
})
export class AuditObjectComponent {
	@ViewChild('content', {read: ViewContainerRef}) content: any;

	@Input() auditObject: any = {};
	@Input() auditType: string = '';

	private componentRef: ComponentRef<any>;

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver
	) {}

	ngOnInit() {
		if (!AuditObjectTypes.objects.hasOwnProperty(this.auditType)) {
			console.warn(`WARNING: Improperly configured audit type: ${this.auditType}.  Using default.`);
			this.auditType = 'default';
		}

		let factory: ComponentFactory<Component> =
			this.componentFactoryResolver.resolveComponentFactory(AuditObjectTypes.objects[this.auditType]);

		this.componentRef = this.content.createComponent(factory);
		this.componentRef.instance.auditObject = this.auditObject;
	}
}
