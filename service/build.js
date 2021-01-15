import path from 'path';

import Constants from '../constants';

import LibraryUtility from '@thzero/library_common/utility';

import Service from '@thzero/library_common/service';

import ProcessBuildService from './process';

class BuildService extends Service {
    constructor() {
		super();

		this._buildProcessors = [];
	}

	async init(injector) {
		await super.init(injector);

		const services = injector.getSingletons();
		for (const service of services) {
			if (!(service instanceof ProcessBuildService))
				continue;

			this._buildProcessors.push(service);
		}
	}

	async process(correlationId) {
		try {
			if (process.argv.length < 3)
				throw Error('Invalid arguments, must specific a build type name.');
			const name = process.argv[2];
			if (String.isNullOrEmpty(name))
				throw Error('Invalid arguments, must specific a build type name.');

			this._logger.info2('');
			this._logger.info2(`building '${name}'...`);

			const builds = this._config.get("builds");
			this._enforceNotNull('BuildService', 'process', builds, 'builds', correlationId);
			const build = builds.find(l => l.name.toLowerCase() === name.toLowerCase());
			this._enforceNotNull('BuildService', 'process', build, 'build', correlationId);
			this._enforceNotNull('BuildService', 'process', build.repos, 'build.repos', correlationId);

			const tag = build.tag ? build.tag : Constants.BuildTags.Standard;
			const buildService = this._buildProcessors.find(l => l.tag === tag);
			this._enforceNotNull('BuildService', 'buildService', buildService, 'buildService', correlationId);

			return await this._processRepos(correlationId, build.repos, buildService);
		}
		catch (err) {
			return this._error('BuildService', 'process', null, err, null, null, correlationId);
		}
		finally {
			this._logger.info2(`...building completed.`);
			this._logger.info2('');
		}
	}

	async _processRepos(correlationId, repos, buildService) {
		this._enforceNotNull('BuildService', '_processRepos', repos, 'repos', correlationId);
		this._enforceNotNull('BuildService', '_processRepos', buildService, 'buildService', correlationId);

		let response;
		for (const repo of repos) {
			this._logger.debug('BuildService', '_processRepos', 'repo', repo, correlationId);

			if (repo.isGroup)
				return await this._processRepos(correlationId, repo.repos, buildService);

			this._logger.debug('BuildService', '_processRepos', 'repo.repo', repo.repo, correlationId);
			if (String.isNullOrEmpty(repo.repo))
				throw Error('Repo has invalid repo name');

			response = await this._processExecute(correlationId, LibraryUtility.cloneDeep(repo), buildService);
			if (!response.success)
				return response;
		}

		return this._success(correlationId);
	}

	async _processExecute(correlationId, repo, buildService) {
		try {
			this._enforceNotNull('BuildService', '_process', repo, 'repo', correlationId);
			this._enforceNotEmpty('BuildService', '_process', repo.repo, 'repo.repo', correlationId);
			this._enforceNotNull('BuildService', '_process', buildService, 'buildService', correlationId);

			this._logger.info2('-----------');
			this._logger.info2(`processing repo '${repo.repo}'.`);

			const repoCwdPath = path.normalize(`${process.cwd()}\\..\\${repo.repo}`);

			const packagePath = `${repoCwdPath}\\package.json`;
			this._logger.debug('BuildService', '_process', 'packagePath', packagePath, correlationId);

			repo.pathCwd = repoCwdPath;
			repo.pathPackage = packagePath;
			repo.label = null;
			repo.dependencyCheck = repo.dependencyCheck !== undefined ? repo.dependencyCheck : true;

			return buildService.process(LibraryUtility.generateId(), repo);
		}
		finally {
			this._logger.info2(`...processed repo '${repo ? repo.repo : '<unknown>'}'.`);
			this._logger.info2('-----------\n');
		}
	}
}

export default BuildService;
