import Constants from '../../constants';

import ProcessBuildService from './index';

class StandardProcessBuildService extends ProcessBuildService {
    constructor() {
		super();

		this._serviceDependencyUpdate = null;
		this._serviceSourceLocalStatus = null;
		this._serviceSourceRemote = null;

		this.actionDependencyUpdate = 'dependency';
		this.actionSourceLocalCommit = 'commit';
		this.actionSourceLocalStatus = 'status';
		this.actionSourceRemote = 'remote';
	}

	async init(injector) {
		await super.init(injector);

		this._serviceDependencyUpdate = this._injector.getService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_DEPENDENCY_UPDATE);
		this._serviceSourceLocalCommit = this._injector.getService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_SOURCE_LOCAL_COMMIT);
		this._serviceSourceLocalStatus = this._injector.getService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_SOURCE_LOCAL_STATUS);
		this._serviceSourceRemote = this._injector.getService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_SOURCE_REMOTE);
	}

	async _process(correlationId, repo) {
		let response;

		let valid = false;

		if (repo.dependencyCheck || this._checkAction(correlationId, repo, this.actionDependencyUpdate)) {
			response = await this._serviceDependencyUpdate.process(correlationId, repo);
			if (!response.success)
				return response;
			valid = response.results;
		}

		if (this._checkAction(correlationId, repo, this.actionSourceLocalStatus)) {
			response = await this._serviceSourceLocalStatus.process(correlationId, repo);
			if (!response.success)
				return response;
			valid |= response.results;
		}

		if (!valid)
			return response;

		if (String.isNullOrEmpty(repo.label))
			throw Error('No label.');

		if (this._checkAction(correlationId, repo, this.actionSourceLocalCommit)) {
			response = await this._serviceSourceLocalCommit.process(correlationId, repo);
			if (!response.success || !response.results)
				return response;
		}


		if (this._checkAction(correlationId, repo, this.actionSourceRemote)) {
			response = await this._serviceSourceRemote.process(correlationId, repo);
			if (!response.success || !response.results)
				return response;
		}

		return response;
	}

	get tag() {
		return Constants.BuildTags.Standard;
	}
}

export default StandardProcessBuildService;
