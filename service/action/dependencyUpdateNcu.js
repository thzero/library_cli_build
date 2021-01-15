import ncu from 'npm-check-updates';

import ActionBuildService from './index';

class NcuDepdencyUpdateBuildService extends ActionBuildService {
    constructor() {
		super();
	}

	async _process(correlationId, repo) {
		let upgrades = await ncu.run({
			upgrade: true,
			jsonUpgraded: true,
			silent: false,
			packageFile: repo.packagePath
		});

		this._logger.debug('NcuDepdencyUpdateBuildService', '_process', 'upgrades', upgrades, correlationId);

		const upgraded = (upgrades ? (Object.entries(upgrades).length > 0) : false);
		this._logger.debug('NcuDepdencyUpdateBuildService', '_process', 'upgrades', upgraded, correlationId);

		return this._successResponse(upgraded, correlationId);
	}

	get _step() {
		return 'ncu';
	}
}

export default NcuDepdencyUpdateBuildService;
