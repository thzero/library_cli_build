import BootMain from './boot';

import BuildPlugin from './boot/plugins/build';

(async () => {
	await (new BootMain()).start(BuildPlugin);
})();
