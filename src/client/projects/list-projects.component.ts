import { Component, Input } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Modal } from 'angular2-modal/plugins/bootstrap';

import { User } from '../admin/user.class';
import { PagingOptions } from '../shared/pager.component';
import { SortDirection, SortDisplayOption } from '../shared/result-utils.class';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { ProjectsService } from './projects.service';

@Component({
	selector: 'list-projects',
	templateUrl: './list-projects.component.html',
	// directives: [AlertComponent, Pager, TOOLTIP_DIRECTIVES, ROUTER_DIRECTIVES, CORE_DIRECTIVES],
	// pipes: [AgoDatePipe],
})
export class ListProjectsComponent {

	@Input() readOnly: boolean = true;

	private projects: any[] = [];

	private teamId: string;

	private user: User;

	private search: string;

	private sortOptions: any = {};

	private pagingOptions: PagingOptions;

	private maxResourcesShownInline = 3;

	private loading: boolean = false;

	constructor(
		private modal: Modal,
		private router: Router,
		private route: ActivatedRoute,
		private alertService: AlertService,
		private auth: AuthenticationService,
		private projectsService: ProjectsService
	) {
	}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();

		this.sortOptions.name = new SortDisplayOption('Name', 'name', SortDirection.asc);
		this.sortOptions.created = new SortDisplayOption('Created', 'created', SortDirection.desc);
		this.sortOptions.updated = new SortDisplayOption('Updated', 'updated', SortDirection.desc);

		this.pagingOptions = new PagingOptions();
		this.pagingOptions.sortField = this.sortOptions.name.sortField;
		this.pagingOptions.sortDir = this.sortOptions.name.sortDir;

		this.route.params.subscribe((params: Params) => {
			this.teamId = params[`id`];

			this.getProjects();
		});
	}

	private getProjects() {
		let query:any = {
			owner: {'$in': this.teamId}
		};
		let options:any = {};

		this.loading = true;
		this.projectsService.searchProjects(query, this.search, this.pagingOptions, options)
			.subscribe(
				(result:any) => {
					if (null != result && null != result.elements && result.elements.length > 0) {
						this.projects = result.elements;
						this.pagingOptions.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
					} else {
						this.projects = [];
						this.pagingOptions.reset();
					}
				},
				err => {
					console.error(err);
				},
				() => {
					this.loading = false;
				});
	}

	private goToPage(event: any) {
		this.pagingOptions.update(event.pageNumber, event.pageSize);
		this.getProjects();
	}

	private applySearch() {
		this.pagingOptions.setPageNumber(0);
		this.getProjects();
	}

	private setSort(sortOpt: SortDisplayOption) {
		if (sortOpt.sortField === this.pagingOptions.sortField){
			this.pagingOptions.sortDir = (this.pagingOptions.sortDir === SortDirection.asc)? SortDirection.desc : SortDirection.asc;
		} else {
			this.pagingOptions.sortField = sortOpt.sortField;
			this.pagingOptions.sortDir = sortOpt.sortDir;
		}
		this.getProjects();
	};

	private removeProject(project: any) {
		this.modal.confirm()
			.size('lg')
			.showClose(true)
			.isBlocking(true)
			.title('Remove project from team?')
			.body(`Are you sure you want to remove project: "${project.name}" from this team?`)
			.okBtn('Remove Project')
			.open()
			.then(
				(resultPromise: any) => resultPromise.result.then(
					() => {
						this.projectsService.deleteProject(project._id)
							.subscribe(() => {
									this.getProjects();
								},
								(response: Response) => {
									if (response.status >= 400 && response.status < 500) {
										this.alertService.addAlert(response.json().message);
									}
								});
					}
				)
			);
	}
}
