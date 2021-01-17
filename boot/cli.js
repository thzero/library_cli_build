import minimist from 'minimist';

const { version } = require('../package.json');
const appVersion = version;

class Cli {
	run() {
		const args = minimist(process.argv.slice(2));
		this._determineCommand(args);
		return this._processCommand(args);
	}

	get args() {
		return this._args;
	}

	_determineCommand(args) {
		this._cmd = 'build';

		if (args.version || args.v)
			this._cmd = 'version';

		if (args.help || args.h)
			this._cmd = 'help';
	}

	_menu() {
		const menus = {
			default: `
library-cli-build <options>

	--help, --h :: help

	--version, --v :: cli version

	--build, --b <build label> :: name of the build specified in the configuration to be processed :: required
	--dependencyCheck, --dc :: check and update dependencies, then commit, build, and deploy :: default
	--label, --l <label> ::
	--versionIncrement, --vi :: increment version update
	--versionUpdate, --vu <major.minor.patch> :: update version to the specified version in <major.minor.patch> form`,
		};

		return menus;
	}

	_processCommand(args) {
		switch (this._cmd) {
			case 'build':
				console.log('build');

				this._args = {
					dependencyCheck: true
				};

				if ((args.build !== null && args.build !== undefined) || (args.b !== null && args.b !== undefined))
					this._args.build = args.build || args.b;

				if ((args.dependencyCheck !== null && args.dependencyCheck !== undefined) || (args.dc !== null && args.dc !== undefined))
					this._args.dependencyCheck = args.dependencyCheck || args.dc;

				if ((args.versionIncrement !== null && args.versionIncrement !== undefined) || (args.vi !== null && args.vi !== undefined))
					this._args.versionIncrement = args.versionIncrement || args.vi;

				if ((args.versionUpdate !== null && args.versionUpdate !== undefined) || (args.vu !== null && args.vu !== undefined))
					this._args.versionUpdate = args.versionUpdate || args.vu;

				if ((args.label !== null && args.label !== undefined) || (args.l !== null && args.l !== undefined))
					this._args.label = args.label || args.l;

				console.log(this._args);
				if (String.isNullOrEmpty(this._args.build)) {
					console.log('No --build specified, see --help.');
					return false;
				}

				return true;

			case 'help':
				console.log(this._menu().default);
				return  false;

			case 'version':
				console.log(this._version(appVersion));
				return  false;
		}

		console.error(`"${cmd}" is not a valid command!`)
		return  false;
	}

	_version(appVersion) {
		return `
library-cli-build version '${appVersion}'`;
	}
}

export default Cli;
