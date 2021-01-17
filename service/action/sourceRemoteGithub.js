import { Octokit } from '@octokit/core';

import ActionBuildService from './index';

class GitHubSourceRemoteBuildService extends ActionBuildService {
    constructor() {
		super();

		this._octokit = null;
	}

	async init(injector) {
		super.init(injector);

		this._octokit = new Octokit({ auth: this._config.get('token') });
		if (!this._octokit)
			throw Error('Invalid octokit!');
	}

	async _process(correlationId, repo) {
		let response = await this._pullRequest(correlationId, repo);
		if (!response.success)
			return response;

		if (!repo.wait)
			return this._successResponse(true, correlationId);

		response = await this._checkWorkflow(correlationId, repo);
		if (!response.success)
			return response;

		return this._successResponse(response.results, correlationId);
	}

	async _checkWorkflow(correlationId, repoI) {
		try {
			this._info(`check workflow for completion...`);

			const owner = this._config.get('owner');
			const repo = repoI.repo;

			let response = await this._octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
				owner,
				repo,
				status: 'in_progress'
			});
			if (!response || (response.status !== 200))
				return this._error('GitHubSourceRemoteBuildService', '_checkWorkflow', 'Error trying to get workflow.', null, null, null, correlationId);

			const results = response.data.workflow_runs && response.data.workflow_runs.length > 0;
			if (!results) {
				this._info(`No active workflow found.`);
				return this._successResponse(true, correlationId);
			}

			const workflow = response.data.workflow_runs.pop();
			if (!workflow) {
				this._info(`No active workflow found.`);
				return this._successResponse(true, correlationId);
			}

			let run_id = workflow.id;
			console.log('\t\tworkflow.id', run_id);

			const interval = 1000 * 45;

			// const timeout = (prom, time) => Promise.race([prom, new Promise((_r, rej) => setTimeout(() => { rej({ success: false }); }, time))]);
			// await timeout(new Promise((resolve, reject) => {
			// 	const timer = setInterval((async function () {
			// 		try {
			// 			response = await this._octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
			// 				owner,
			// 				repo,
			// 				run_id
			// 			});
			// 			if (!response || (response.status !== 200))
			// 				throw Error(`Error trying to check workflow '${run_id}'.`);

			// 			if (response.data.status === 'completed') {
			// 				clearInterval(timer);
			// 				resolve({ success: true });
			// 				return;
			// 			}
			// 		}
			// 		catch(err) {
			// 			reject(err);
			// 		}
			// 	}).bind(this), 1000 * 15);
			// }), interval);
			const promiseTimer = new Promise((resolve, reject) => {
				const timer = setInterval((async function () {
					try {
						response = await this._octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
							owner,
							repo,
							run_id
						});
						if (!response || (response.status !== 200))
							throw Error(`Error trying to check workflow '${run_id}'.`);

						if (response.data.status === 'completed') {
							clearInterval(timer);
							resolve(this._successResponse(true, correlationId));
							return;
						}
					}
					catch(err) {
						reject(err);
					}
				}).bind(this), 1000 * 15);
			});

			response = await promiseTimer;
			return response;
		}
		catch (err) {
			return this._error('GitHubSourceRemoteBuildService', '_checkWorkflow', null, err, null, null, correlationId);
		}
		finally {
			this._info(`...checking workflow completed.`);
		}
	}

	async _pullRequest(correlationId, repoI) {
		try {
			this._info(`creating github pull request...`);

			const responseCreate = await this._pullRequestCreate(correlationId, repoI);
			if (!responseCreate.success)
				return responseCreate;

			const responseMerge = await this._pullRequestMerge(correlationId, repoI);
			if (!responseMerge.success)
				return responseMerge;

			return this._successResponse(true, correlationId);
		}
		catch (err) {
			return this._error('GitHubSourceRemoteBuildService', '_pullRequest', null, err, null, null, correlationId);
		}
		finally {
			this._info(`...creating github pull request completed.`);
		}
	}

	async _pullRequestCreate(correlationId, repoI) {
		try {
			this._info2(`creating github pull request...`);

			if (repoI.pullNumber) {
				this._logger.debug('GitHubSourceRemoteBuildService', '_pullRequest', 'pullNumber', pullNumber, correlationId);
				return this._successResponse(pullNumber, correlationId);
			}

			const config = {
				owner: this._config.get('owner'),
				repo: repoI.repo,
				title: repoI.label,
				body: repoI.label,
				head: 'dev',
				base: 'master'
			};

			let response = await this._octokit.request(`POST /repos/{owner}/{repo}/pulls`, config);
			if (!response || (response.status !== 201))
				return this._error('GitHubSourceRemoteBuildService', '_pullRequest', 'Error trying to create pull request.', null, null, null, correlationId);

			repoI.pullNumber = response.data.number;

			// TODO
			// if (!response.data.mergeable) {
			// 	this._info(`Pull request '${pull_number}' not mergeable.`);
			// 	return this._successResponse(response.mergeable, correlationId);
			// }

			this._logger.debug('GitHubSourceRemoteBuildService', '_pullRequest', 'pullNumber', repoI.pullNumber, correlationId);

			this._info2(`...creating github pull request '${repoI.pullNumber}' completed.`);
			return this._successResponse(pullNumber, correlationId);
		}
		catch (err) {
			this._info2(`...creating github pull request failed.`);
			return this._error('GitHubSourceRemoteBuildService', '_pullRequest', null, err, null, null, correlationId);
		}
	}

	async _pullRequestMerge(correlationId, repoI) {
		try {
			this._enforceNotNull('GitHubSourceRemoteBuildService', '_pullRequestMerge', repoI.pullNumber, 'repoI.pullNumber', correlationId);

			this._info2(`merging github pull request '${repoI.pullNumber}...`);

			const config = {
				owner: this._config.get('owner'),
				repo: repoI.repo,
				pull_number: repoI.pullNumber
			};

			const response = await this._octokit.request(`PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`, config);
			if (!response || (response.status !== 200))
				return this._error('GitHubSourceRemoteBuildService', '_pullRequest', `Error trying to merge pull request '${pull_number}.`, null, null, null, correlationId);

			this._info(`...creating github pull request '${repoI.pullNumber}' completed.`);
			return this._successResponse(true, correlationId);
		}
		catch (err) {
			this._info(`...creating github pull request '${repoI.pullNumber}' failed.`);
			return this._error('GitHubSourceRemoteBuildService', '_pullRequest', null, err, null, null, correlationId);
		}
	}

	get _step() {
		return 'github';
	}
}

export default GitHubSourceRemoteBuildService;
