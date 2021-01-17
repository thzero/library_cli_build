import NotImplementedError from '@thzero/library_common/errors/notImplemented';

import Service from '@thzero/library_common/service';

class ActionBuildService extends Service {
	constructor() {
		super();
	}

	async process(correlationId, repo) {
		try {
			this._enforceNotNull('ActionBuildService', 'process', repo, 'args', correlationId);
			this._enforceNotEmpty('ActionBuildService', 'process', repo.repo, 'repo', correlationId);
			this._enforceNotEmpty('ActionBuildService', 'process', repo.pathCwd, 'pathCwd', correlationId);
			this._enforceNotEmpty('ActionBuildService', 'process', repo.pathPackage, 'pathPackage', correlationId);

			this._logger.info2(`\tprocessing ${this._step}...`);

			return await this._process(correlationId, repo);
		}
		catch (err) {
			return this._error('ActionBuildService', 'process', null, err, null, null, correlationId);
		}
		finally {
			this._logger.info2(`\t...processed ${this._step}`);
		}
	}

	_checkAction(correlationId, repo, action) {
		this._enforceNotNull('ProcessBuildService', '_checkAction', repo, 'repo', correlationId);
		this._enforceNotNull('ProcessBuildService', '_checkAction', action, 'action', correlationId);

		return (repo.action && (action.toLowerCase() === repo.action.toLowerCase()));
	}

	async _process(correlationId, repo) {
		throw new NotImplementedError();
	}

	get _step() {
		throw new NotImplementedError();
	}

	_info(message) {
		this._logger.info2(`\t\t${message}`);
	}

	_info2(message) {
		this._logger.info2(`\t\t\t${message}`);
	}
}

export default ActionBuildService;
