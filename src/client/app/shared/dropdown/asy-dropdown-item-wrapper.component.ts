import {
	Component, Input, ViewContainerRef, ViewChild, ComponentRef, ComponentFactoryResolver,
	ComponentFactory
} from '@angular/core';

@Component({
	selector: 'asy-dropdown-item-wrapper',
	template: '<div #content></div>'
})
export class AsyDropdownItemWrapperComponent {

	@ViewChild('content', {read: ViewContainerRef}) content: any;

	@Input() item: any = {};

	@Input() value: string;

	@Input() options: any = {};

	componentRef: ComponentRef<any>;

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver
	) {}

	ngOnInit() {
		if (null == this.item.handler) {
			// console.warn(`WARNING: Improperly configured click handler: ${this.item}.`);
		}
		else {
			let factory: ComponentFactory<Component> =
				this.componentFactoryResolver.resolveComponentFactory(this.item.handler);

			this.componentRef = this.content.createComponent(factory);
			this.componentRef.instance.value = this.value;
			this.componentRef.instance.options = this.options;
		}
	}

}
