import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';
import { PagingOptions } from '../../shared/pager.component';
import { Project } from './projects.class';

@Injectable()
export class ProjectsService {

	public cache: any = {};

	constructor(
		private asyHttp: AsyHttp
	) {
	}

	public searchProjects(query: any, search: string, paging: PagingOptions, options: any): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('projects?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query, options: options }));
	}

	// Retrieve all projects (or up to 1000)
	public selectionList(): Observable<Response> {
		return this.searchProjects({}, null, new PagingOptions(0, 1000), {});
	}

	public getProject(projectId: string): Observable<Response> {
		return this.asyHttp.get(new HttpOptions('project/' + projectId, () => {}));
	}

	public createProject(project: Project): Observable<Response> {
		return this.asyHttp.put(new HttpOptions('project', () => {}, project));
	}

	public updateProject(project: Project): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('project/' + project._id, () => {}, project));
	}

	public deleteProject(projectId: string): Observable<Response> {
		return this.asyHttp.delete(new HttpOptions('project/' + projectId, () => {}));
	}
}
