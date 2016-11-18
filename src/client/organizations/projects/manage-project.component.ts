import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { Team } from '../teams/teams.class';
import { TeamsService } from '../teams/teams.service';
import { Owner } from './owner.class';
import { Project } from './projects.class';
import { ProjectsService } from './projects.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';

@Component({
	selector: 'manage-project',
	templateUrl: './manage-project.component.html'
	// directives: [AlertComponent, ROUTER_DIRECTIVES],
	// providers: []
})

export class ManageProjectComponent {

	private team: Team;

	private owner: Owner;

	private mode: string;

	private modeDisplay: string;

	private project: Project;

	private error: string = null;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthenticationService,
		private teamsService: TeamsService,
		private projectsService: ProjectsService
	) {
	}

	ngOnInit() {
		this.project = new Project();

		this.route.params.subscribe((params: Params) => {
			this.mode = params[`mode`];
			this.modeDisplay = this.mode.substr(0, 1).toUpperCase() + this.mode.substr(1);

			let projectId = params[`id`];
			let teamId = params[`teamId`];

			// Initialize project if appropriate
			if (projectId) {
				this.projectsService.getProject(projectId)
					.subscribe((result: any) => {
						if (result) {
							this.project = result;
							this.team = new Team(result.owner);
						}
					});
			}

			if (teamId) {
				this.teamsService.get(teamId)
					.subscribe((result: any) => {
						if (result) {
							this.team = result;
							this.owner = new Owner('team', result._id, result.name);
							this.project.owner = this.owner.id;
						}
					});
			}
		});
	}


	private save() {
		let result: Observable<Response> = this.mode === 'create' ? this.create() : this.update();
		result.subscribe(
			() => this.router.navigate(['/team/:id', {id: this.team._id}]),
			(response: Response) => {
				if (response.status >= 400 && response.status < 500) {
					this.error = response.json().message;
				}
			});
	}

	private create(): Observable<Response> {
		return this.projectsService.createProject(this.project);
	}

	private update(): Observable<Response> {
		return this.projectsService.updateProject(this.project);
	}

}
