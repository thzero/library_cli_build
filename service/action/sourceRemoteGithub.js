import simpleGit from 'simple-git';

import { Octokit } from '@octokit/core';

import ActionBuildService from './index';

class GitHubSourceRemoteBuildService extends ActionBuildService {
    constructor() {
		super();

		this._octokit = null;
	}

	async init(injector) {
		super.init(injector);

		this._octokit = new Octokit({ auth: this._config.token });
		if (!this._octokit)
			throw Error('Invalid octokit!');
	}

	async _process(correlationId, repo) {
		const git = simpleGit({
			baseDir: repo.pathCwd
		});

		let response = await this._pullRequest(correlationId, repo.repo);
		if (!response.success)
			return response;

		response = await this._checkWorkflow(correlationId, repo.repo);
		if (!response.success)
			return response;

		return this._successResponse(results, correlationId);
	}

	async _checkWorkflow(correlationId, repo) {
		try {
			this._logger.info2(`\t\tcheck workflow for completion...`);

			let response = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
				owner: this._config.owner,
				repo: repo,
				status: 'completed'
			});
			if (!response || (response.status !== 200))
				return this._error('GitHubSourceRemoteBuildService', '_checkWorkflow', 'Error trying to get workflow.', null, null, null, correlationId);

			const workflow = response.data.workflow_runs.pop();
			if (!workflow) {
				this._logger.info2(`\t\tNo active workflow found.`);
				return this._success(correlationId);
			}

			let run_id = workflow.id;
			console.log('\t\tworkflow.id', run_id);

			const interval = 1000 * 45;

			const timeout = (prom, time) => Promise.race([prom, new Promise((_r, rej) => setTimeout(() => { rej({ success: false }); }, time))]);
			await timeout(new Promise((resolve, reject) => {
				const timer = setInterval((async function () {
					try {
						response = await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
							owner: this._config.owner,
							repo: repo,
							run_id
						});
						if (!response || (response.status !== 200))
							throw Error(`Error trying to check workflow '${run_id}'.`);

						if (response.data.status === 'completed') {
							clearInterval(timer);
							resolve({ success: true });
							return;
						}
					}
					catch(err) {
						reject(err);
					}
				}).bind(this), 1000 * 15);
			}), interval);

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('GitHubSourceRemoteBuildService', '_checkWorkflow', null, err, null, null, correlationId);
		}
		finally {
			this._logger.info2(`\t\t...checking workflow completed.`);
		}
	}

	async _pullRequest(correlationId, repo) {
		try {
			this._logger.info2(`\t\tcreating github pull request...`);

			const owner = this._config.owner,
				repo = repo,
				title = 'npm updates',
				body = 'npm updates',
				head = 'dev',
				base = 'master';

			let response = await octokit.request(
				`POST /repos/{owner}/{repo}/pulls`, { owner, repo, title, body, head, base }
			);
			if (!response || (response.status !== 201))
				return this._error('GitHubSourceRemoteBuildService', '_pullRequest', 'Error trying to create pull request.', null, null, null, correlationId);

			// console.log(response);

			let pull_number = response.number;
			this._logger.debug('GitHubSourceRemoteBuildService', '_pullRequest', 'pull_number', pull_number, correlationId);

			response = await octokit.request(
				`PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`, { owner, repo, pull_number }
			);
			if (!response || (response.status !== 200))
				return this._error('GitHubSourceRemoteBuildService', '_pullRequest', `Error trying to merge pull request '${pull_number}.`, null, null, null, correlationId);

			return this._success(correlationId);
		}
		catch (err) {
			return this._error('GitHubSourceRemoteBuildService', '_pullRequest', null, err, null, null, correlationId);
		}
		finally {
			this._logger.info2(`\t\t...creating github pull request completed.`);
		}
	}

	get _step() {
		return 'github';
	}
}

export default GitHubSourceRemoteBuildService;
