import { updateVersion } from '@thzero/library_cli/api';

import ActionBuildService from './index';

class VersionBuildService extends ActionBuildService {
    constructor() {
		super();
	}

	async _process(correlationId, repo) {
		const results = await updateVersion({
			packagePath: repo.packagePath,
			pi: true
		});
		this._logger.info2('\t\t' + (results.message || results.error) ? results.message ? results.message : '' : results.error ? results.error : 'failed');

		return this._successResponse(results, correlationId);
	}

	get _step() {
		return 'npm';
	}
}

export default VersionBuildService;
