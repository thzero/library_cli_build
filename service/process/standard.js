import Constants from '../../constants';

import ProcessBuildService from './index';

class StandardProcessBuildService extends ProcessBuildService {
    constructor() {
		super();

		this._serviceDependencyUpdate = null;
		this._serviceSourceLocalStatus = null;
	}

	async init(injector) {
		await super.init(injector);

		this._serviceDependencyUpdate = this._injector.getService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_DEPENDENCY_UPDATE);
		this._serviceSourceLocalCommit = this._injector.getService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_SOURCE_LOCAL_COMMIT);
		this._serviceSourceLocalStatus = this._injector.getService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_SOURCE_LOCAL_STATUS);
	}

	async _process(correlationId, repo) {
		let response;

		if (repo.dependencyCheck) {
			response = await this._serviceDependencyUpdate.process(correlationId, repo);
			if (!response.success)
				return response;

			if (response.results) {
				this._logger.info2(`\tNpm changes detected.`);
				repo.label ? repo.label : 'npm changes';
			}
		}

		response = await this._serviceSourceLocalStatus.process(correlationId, repo);
		if (!response.success)
			return response;

		if (!response.results) {
			this._logger.info2(`\tNo status changes detected; nothing to commit.`);
			return response;
		}

		if (String.isNullOrEmpty(repo.label))
			throw Error('No label.');

		if (!response.results) {
			this._logger.info2(`\tNo changes detected; nothing to commit.`);
			return response;
		}

		// response = await this._serviceSourceLocalCommit.process(correlationId, repo);
		// if (!response.success)
		// 	return response;

// // 		results = await processGitCommit(repoCwdPath);
// // 		if (!results.success)
// // 			throw Error(results);

// // 		results = await processGitHubPullRequest(octokit, repo);
// // 		if (!results.success)
// // 			throw Error(results);

// // 		results = await processCheckWorkflow(octokit, repo);
// // 		if (!results.success)
// // 			throw Error(results);

		return response;
	}

	get tag() {
		return Constants.BuildTags.Standard;
	}
}

export default StandardProcessBuildService;
