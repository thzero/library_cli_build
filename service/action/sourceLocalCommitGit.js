import simpleGit from 'simple-git';

import ActionBuildService from './index';

class GitSourceLocalCommitBuildService extends ActionBuildService {
    constructor() {
        super();
    }

	async _process(correlationId, repo) {
		const git = simpleGit({
			baseDir: repo.pathCwd
		});

		const results = [];

		let result = await git.init();
		results.push(result);
		result = await git.add('.');
		results.push(result);
		result = await git.commit(repo.label);
		results.push(result);
		result = await git.push();
		results.push(result);

		return this._successResponse(results, correlationId);
	}

	get _step() {
		return 'git commit';
	}
}

export default GitSourceLocalCommitBuildService;
