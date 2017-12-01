import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { PagingOptions } from '../shared/pager.component';
import { Team, TeamMember } from './teams.class';
import { User } from '../admin/user.class';
import { ObservableUtils } from '../shared/observable-utils.class';
import { ObservableResult } from '../shared/observable-result.class';
import { Resource } from '../resources/resource.class';
import { AuthenticationService } from '../admin/authentication/authentication.service';

export interface ITeamResults {
	pageNumber: number;
	pageSize: number;
	totalPages: number;
	totalSize: number;
	elements: Team[];
}

export const NULL_TEAM_RESULTS: ITeamResults = {
	pageNumber: 0,
	pageSize: 0,
	totalPages: 0,
	totalSize: 0,
	elements: []
};

@Injectable()
export class TeamsService {

	cache: any = {};

	teamMap: any = {};

	constructor(
		private asyHttp: AsyHttp,
		private authService: AuthenticationService
	) {
	}


	resolveTeamNames(users: User[]) {
		if (_.isArray(users)) {
			// Defensive checking against null teams field
			users.forEach((user: any) => {
				user.userModel.teams = user.userModel.teams || [];
			});

			// Get unique list of team ids to query
			let teamIds: string[] = _.uniq(_.flatMap(users, (user: any) => user.userModel.teams.map((t: any) => t._id)));

			// Check to see if these ids have been cached
			let idsToQuery = teamIds.filter((id: string) => !this.teamMap.hasOwnProperty(id));

			// Retrieve data about unknown team ids
			ObservableUtils.forkJoinSettled(idsToQuery.map((id: string) => this.get(id)))
				.subscribe(
					(results: ObservableResult[]) => {
						results.forEach((result, i) => {
							if (result.state === 'success') {
								this.teamMap[result.value._id] = result.value.name;
							} else {
								this.teamMap[idsToQuery[i]] = '<missing>';
							}
						});
					});
		}
	}

	search(query: any, search: any, paging: PagingOptions, options: any): Observable<Response> {
		return this.asyHttp.post(new HttpOptions(`teams?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}, { s: search , q: query, options: options }));
	}

	// Retrieve all teams (or up to 1000)
	selectionList(): Observable<Response> {
		return this.search({}, null, new PagingOptions(0, 1000), {});
	}

	getTeams(paging: PagingOptions): Observable<ITeamResults> {
		return this.asyHttp.get(new HttpOptions(`teams?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}))
			.catch(() => {
				return Observable.of<ITeamResults>(NULL_TEAM_RESULTS);
			});
	}

	get(teamId: string): Observable<Response> {
		return this.asyHttp.get(new HttpOptions(`team/${teamId}`, () => {}));
	}

	requestAccessToTeam(teamId: string, user: TeamMember): Observable<Response> {
		return this.asyHttp.post(new HttpOptions(`team/${teamId}/request`, () => {}, { user: user }));
	}

	requestNewTeam(user: TeamMember, org: string, aoi: string, description: string): Observable<Response> {
		return this.asyHttp.post(new HttpOptions(`team-request`, () => {}, { user, org, aoi, description }));
	}

	searchMembers(teamId: string, team: Team, query: any, search: any, paging: PagingOptions, resolveTeamNames: boolean = true): Observable<any> {
		return Observable.create((observer: any) => {
			this.asyHttp.post(new HttpOptions(`team/${teamId}/members?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}, { s: search , q: query }))
				.subscribe(
					(results: any) => {
						if (null != results && _.isArray(results.elements)) {
							results.elements = results.elements.map((element: any) => new TeamMember().setFromTeamMemberModel(team, element));
							if (resolveTeamNames) {
								this.resolveTeamNames(results.elements);
							}
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

	/**
	 * Determine whether user can modify resource or just view it
	 */
	canManageResource(user: TeamMember, resource: Resource) {
		if (resource.owner.type === 'user') {
			return true;
		}
		return user.canManageTeamResources(new Team(resource.owner._id));
	}

	getCurrentUserAsTeamMember() {
		return new TeamMember().setFromTeamMemberModel(null, this.authService.getCurrentUser().userModel);
	}

}
