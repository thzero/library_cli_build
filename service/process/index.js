import NotImplementedError from '@thzero/library_common/errors/notImplemented';

import Service from '@thzero/library_common/service';

class ProcessBuildService extends Service {
	constructor() {
		super();
	}

	async process(correlationId, repo) {
		this._enforceNotNull('ProcessBuildService', 'process', repo, 'repo', correlationId);
		this._enforceNotEmpty('ProcessBuildService', 'process', repo.repo, 'repo', correlationId);

		return await this._process(correlationId, repo);
	}

	async _process(correlationId, repo) {
		throw new NotImplementedError();
	}

	get tag() {
		throw new NotImplementedError();
	}
}

export default ProcessBuildService;
