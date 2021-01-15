import config from 'config';

import Constants from '../constants';
import LibraryCommonConstants from '@thzero/library_common/constants';

import LibraryUtility from '@thzero/library_common/utility';

require('@thzero/library_common/utility/string');
import injector from '@thzero/library_common/utility/injector';

import configService from '@thzero/library_common/service/config';
// import appMetricsMonitoringService from '@thzero/library_server_monitoring_appmetrics';
import loggerService from '@thzero/library_common/service/logger';
import pinoLoggerService from '@thzero/library_server_logger_pino';
import winstonLoggerService from '@thzero/library_server_logger_winston';

import buildService from '../service/build';

import bootCli from './cli';

class BootMain {
	async start(...args) {
		try {
			const cli = new bootCli();
			if (!cli.run())
				return false;

			process.on('uncaughtException', function(err) {
				console.log('Caught exception', err);
				return process.exit(99);
			});

			this._injector = injector;

			LibraryUtility.initDateTime();

			// https://github.com/lorenwest/node-config/wiki
			this._appConfig = new configService(config.get('app'));

			const plugins = this._initPlugins(args);

			injector.addSingleton(LibraryCommonConstants.InjectorKeys.SERVICE_CONFIG, this._appConfig);

			this._services = new Map();
			const loggerServiceI = new loggerService();

			// this._injectService(LibraryCommonConstants.InjectorKeys.SERVICE_MONITORING, new appMetricsMonitoringService());
			this._injectService(Constants.InjectorKeys.SERVICE_LOGGER_PINO, new pinoLoggerService());
			this._injectService(Constants.InjectorKeys.SERVICE_LOGGER_WISTON, new winstonLoggerService());
			this._injectService(LibraryCommonConstants.InjectorKeys.SERVICE_LOGGER, loggerServiceI);
			loggerServiceI.register(Constants.InjectorKeys.SERVICE_LOGGER_PINO);
			loggerServiceI.register(Constants.InjectorKeys.SERVICE_LOGGER_WISTON);

			this._injectService(Constants.InjectorKeys.SERVICE_BUILD, new buildService());

			for (const pluginService of plugins)
				await pluginService.initServices(this._services);

			for (const [key, value] of this._services) {
				console.log(`services.init - ${key}`);
				await value.init(injector);
			}

			try {
				// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
				// const octokit = new Octokit({ auth: config.token });

				// let library = 'library_cli';
				// await processLibrary(library, octokit);
				const service = this._injector.getService(Constants.InjectorKeys.SERVICE_BUILD);
				service.process(LibraryUtility.generateId());
			}
			catch (err) {
				loggerServiceI.exception('Build', 'init', err);
			}
		}
		catch (err) {
			console.error(err);
		}
	}

	_initPlugins(plugins) {
		let obj;
		const results = [];
		for (const plugin of plugins) {
			obj = new plugin();
			obj.init(this._appConfig, injector);
			results.push(obj);
		}
		return results;
	}

	_injectService(key, service) {
		console.log(`services.inject - ${key}`);
		this._services.set(key, service);
		injector.addSingleton(key, service);
	}
}

export default BootMain;
