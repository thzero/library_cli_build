import Constants from '../../constants';

import BootPlugin from './index';

import NcuDepdencyUpdateBuildActionService from '../../service/action/dependencyUpdateNcu';
import GitSourceLocalCommitBuildService from '../../service/action/sourceLocalCommitGit';
import GitSourceLocalStausBuildService from '../../service/action/sourceLocalStatusGit';
import GitHubSourceRemoteBuildActionService from '../../service/action/sourceRemoteGithub';
import VersionBuildActionService from '../../service/action/version';

import StandardProcessBuildService from '../../service/process/standard';

class BuildBootPlugin extends BootPlugin {
	async _initServices() {
		await super._initServices();

		this._injectService(Constants.InjectorKeys.SERVICE_BUILD_STANDARD, new StandardProcessBuildService());

		this._injectService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_DEPENDENCY_UPDATE, new NcuDepdencyUpdateBuildActionService());
		this._injectService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_SOURCE_LOCAL_COMMIT, new GitSourceLocalCommitBuildService());
		this._injectService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_SOURCE_LOCAL_STATUS, new GitSourceLocalStausBuildService());
		this._injectService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_SOURCE_REMOTE, new GitHubSourceRemoteBuildActionService());
		this._injectService(Constants.InjectorKeys.SERVICE_BUILD_ACTION_VERSION, new VersionBuildActionService());
	}
}

export default BuildBootPlugin;
