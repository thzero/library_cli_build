import simpleGit from 'simple-git';

import ActionBuildService from './index';

class GitSourceLocalStausBuildService extends ActionBuildService {
    constructor() {
        super();
    }

	async _process(correlationId, repo) {
		const git = simpleGit({
			baseDir: repo.pathCwd
		});

		const statusResults = await git.status();
		const results = statusResults && statusResults.files ? statusResults.files.length > 0 : false;
		return this._successResponse(results, correlationId);
	}

	get _step() {
		return 'git status';
	}
}

export default GitSourceLocalStausBuildService;
