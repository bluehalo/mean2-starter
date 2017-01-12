import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { PagingOptions } from '../shared/pager.component';
import { Team, TeamMember } from './teams.class';

@Injectable()
export class TeamsService {

	cache: any = {};

	constructor(
		private asyHttp: AsyHttp
	) {
	}

	search(query: any, search: any, paging: PagingOptions, options: any): Observable<Response> {
		return this.asyHttp.post(new HttpOptions(`teams?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}, { s: search , q: query, options: options }));
	}

	// Retrieve all teams (or up to 1000)
	selectionList(): Observable<Response> {
		return this.search({}, null, new PagingOptions(0, 1000), {});
	}

	get(teamId: string): Observable<Response> {
		return this.asyHttp.get(new HttpOptions(`team/${teamId}`, () => {}));
	}

	searchMembers(teamId: string, team: Team, query: any, search: any, paging: PagingOptions): Observable<any> {
		return Observable.create((observer: any) => {
			this.asyHttp.post(new HttpOptions(`team/${teamId}/members?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}, { s: search , q: query }))
				.subscribe(
					(results: any) => {
						if (null != results && _.isArray(results.elements)) {
							results.elements = results.elements.map((element: any) => new TeamMember().setFromTeamMemberModel(team, element));
						}
						observer.next(results);
					},
					(err: any) => {
						observer.error(err);
					},
					() => {
						observer.complete();
					});
		});
	}

	create(team: Team): Observable<Response> {
		return this.asyHttp.put(new HttpOptions('team', () => { }, team));
	}

	update(team: Team): Observable<Response> {
		return this.asyHttp.post(new HttpOptions(`team/${team._id}`, () => {}, team));
	}

	delete(teamId: string): Observable<Response> {
		return this.asyHttp.delete(new HttpOptions(`team/${teamId}`, () => {}));
	}

	addMember(teamId: string, memberId: string, role?: string): Observable<Response> {
		return this.asyHttp.post(new HttpOptions(`team/${teamId}/member/${memberId}`, () => {}, { role: role }));
	}

	updateMemberRole(teamId: string, memberId: string, role: string): Observable<Response> {
		return this.asyHttp.post(new HttpOptions(`team/${teamId}/member/${memberId}/role`, () => {}, { role: role }));
	}

	removeMember(teamId: string, memberId: string): Observable<Response> {
		return this.asyHttp.delete(new HttpOptions(`team/${teamId}/member/${memberId}`, () => {}, {}));
	}

	getTeamsCanManageResources(user: TeamMember): Observable<Team[]> {
		return Observable.create((observer: any) => {
			this.selectionList().subscribe(
				(result: any) => {
					let teams: Team[] = [];
					if (null != result && null != result.elements && result.elements.length > 0) {
						teams = result.elements.map((e: any) => new Team(e._id, e.name, e.description, e.created, e.requiresExternalTeams));
					}
					observer.next(teams.filter((team) => user.canManageTeamResources(team)));
				},
				(err: any) => {
					observer.error(err);
				},
				() => {
					observer.complete();
				}
			);
		});
	}

}

