import { Directive, Input, ViewContainerRef, TemplateRef, OnChanges, SimpleChanges, EmbeddedViewRef } from '@angular/core';
@Directive({
	selector: '[asy-transclude]'
})
export class AsyTransclude implements OnChanges {
	@Input() item: any;
	@Input() index: number;
	@Input('asy-transclude') template: TemplateRef<any>;
	private view: EmbeddedViewRef<any>;

	constructor(private viewContainer: ViewContainerRef) { }

	ngOnChanges(changes: SimpleChanges) {
		if ('template' in changes) {

			this.viewContainer.clear();

			if (this.template) {
				this.view = this.viewContainer.createEmbeddedView(this.template, {
					index: this.index,
					$implicit: this.item
				});
			}
		}
	}
}
