// // import childProcess from 'child_process';
// import path from 'path';

// import config from 'config';

// import ncu from 'npm-check-updates';

// import simpleGit from 'simple-git';

// import { Octokit } from '@octokit/core';

// import spawn from 'await-spawn';

// import Constants from './constants'
// import LibraryCommonConstants from '@thzero/library_common/constants';

// import Utility from '@thzero/library_common/utility';

// import Service from '@thzero/library_common/service';

// import { updateVersion } from '@thzero/library_cli/api';

// require('@thzero/library_common/utility/string');
// import injector from '@thzero/library_common/utility/injector';

// // import appMetricsMonitoringService from '@thzero/library_server_monitoring_appmetrics';
// import loggerService from '@thzero/library_common/service/logger';
// import pinoLoggerService from '@thzero/library_server_logger_pino';
// import winstonLoggerService from '@thzero/library_server_logger_winston';

// class BuildService extends Service {
//     constructor() {
//         super();
//     }

// }

// // async function processLibrary(library, octokit) {
// // 	try {
// // 		console.log('-----------');
// // 		console.log('processing library', library);

// // 		let libraryCwdPath = path.normalize(`${process.cwd()}\\..\\${library}`);

// // 		const packagePath = `${libraryCwdPath}\\package.json`;
// // 		console.log('\tpackagePath', packagePath);

// // 		let results = await processUpdatePackage(packagePath);
// // 		if (!results.success)
// // 			throw Error(results);
// // 		if (!results.upgraded)
// // 			return;

// // 		await processUpdateNpm(libraryCwdPath);

// // 		results = await processUpdateVersion(packagePath);
// // 		if (!results.success)
// // 			throw Error(results);

// // 		results = await processGitCommit(libraryCwdPath);
// // 		if (!results.success)
// // 			throw Error(results);

// // 		results = await processGitHubPullRequest(octokit, library);
// // 		if (!results.success)
// // 			throw Error(results);

// // 		results = await processCheckWorkflow(octokit, library);
// // 		if (!results.success)
// // 			throw Error(results);
// // 	}
// // 	catch (err) {
// // 		console.error(err);
// // 	}
// // 	finally {
// // 		console.log('...processed library', library);
// // 		console.log('-----------\n');
// // 	}
// // }

// // async function processGitCommit(cwdPath) {
// // 	try {
// // 		console.log('\tcommitting...');

// // 		const git = simpleGit({
// // 			baseDir: cwdPath
// // 		});

// // 		const results = [];

// // 		let result = await git.init();
// // 		results.push(result);
// // 		result = await git.add('.');
// // 		results.push(result);
// // 		result = await git.commit('npm updates');
// // 		results.push(result);
// // 		result = await git.push();
// // 		results.push(result);

// // 		// console.log(results);

// // 		return { success: true };
// // 	}
// // 	finally {
// // 		console.log('\t...committing completed.');
// // 	}
// // }

// // async function processGitHubCheckWorkflow(octokit, library) {
// // 	try {
// // 		console.log('\tchecking github workflow for completion...');

// // 		let response = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
// // 			owner: config.owner,
// // 			repo: library,
// // 			status: 'completed'
// // 		});
// // 		if (!response || (response.status !== 200))
// // 			throw Error('Error trying to get workflow.');

// // 		const workflow = response.data.workflow_runs.pop();
// // 		if (!workflow) {
// // 			console.log('\t\tNo active workflow found.');
// // 			return { success: true };
// // 		}

// // 		let run_id = workflow.id;
// // 		console.log('\t\tworkflow.id', run_id);

// // 		const interval = 1000 * 45;

// // 		const timeout = (prom, time) => Promise.race([prom, new Promise((_r, rej) => setTimeout(() => { rej({ success: false }); }, time))]);
// // 		return await timeout(new Promise((resolve, reject) => {
// // 			const timer = setInterval((async function () {
// // 				try {
// // 					response = await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
// // 						owner: config.owner,
// // 						repo: library,
// // 						run_id
// // 					});
// // 					if (!response || (response.status !== 200))
// // 						throw Error(`Error trying to check workflow '${run_id}'.`);

// // 					if (response.data.status === 'completed') {
// // 						clearInterval(timer);
// // 						resolve({ success: true });
// // 						return;
// // 					}
// // 				}
// // 				catch(err) {
// // 					reject(err);
// // 				}
// // 			}).bind(this), 1000 * 15);
// // 		  }), interval);
// // 	}
// // 	finally {
// // 		console.log('\t...checking github workflow completed.');
// // 	}
// // }

// // async function processGitHubPullRequest(octokit, library) {
// // 	try {
// // 		console.log('\tcreating github pull request...');

// // 		const owner = config.owner,
// // 			repo = library,
// // 			title = 'npm updates',
// // 			body = 'npm updates',
// // 			head = 'dev',
// // 			base = 'master';

// // 		let response = await octokit.request(
// // 			`POST /repos/{owner}/{repo}/pulls`, { owner, repo, title, body, head, base }
// // 		);
// // 		if (!response || (response.status !== 201))
// // 			throw Error('Error trying to create pull request.');
// // 		// console.log(response);

// // 		let pull_number = response.number;
// // 		console.log('\t\tpull number', pull_number);

// // 		response = await octokit.request(
// // 			`PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`, { owner, repo, pull_number }
// // 		);
// // 		if (!response || (response.status !== 200))
// // 			throw Error(`Error trying to merge pull request '${pull_number}.`);
// // 	}
// // 	finally {
// // 		console.log('\t...creating github pull request completed.');
// // 	}
// // }

// // async function processUpdateNpm(cwdPath) {
// // 	try {
// // 		console.log('\tupdating packages...');

// // 		await spawn(path.normalize('npm.cmd'),
// // 			['i'],
// // 			{
// // 				cwd: cwdPath,
// // 				stdio: 'inherit'
// // 			});

// // 		return { success: true };
// // 	}
// // 	finally {
// // 		console.log('\t...updating packages completed.');
// // 	}
// // }

// // async function processUpdatePackage(packagePath) {
// // 	try {
// // 		console.log('\tchecking for package upgrades...');
// // 		let upgrades = await ncu.run({
// // 			upgrade: true,
// // 			jsonUpgraded: true,
// // 			silent: false,
// // 			packageFile: packagePath
// // 		});

// // 		console.log('\t\tupgrades...', upgrades);

// // 		const upgraded = (upgrades ? (Object.entries(upgrades).length > 0) : false);
// // 		console.log('\t\tupgraded...', upgraded);

// // 		return { success: true, upgraded: upgraded };
// // 	}
// // 	finally {
// // 		console.log('\t...checking for package upgrades completed.');
// // 	}
// // }

// // async function processUpdateVersion(packagePath) {
// // 	try {
// // 		console.log('\tupdating version...');

// // 		const results = await updateVersion({
// // 			packagePath: packagePath,
// // 			pi: true
// // 		});
// // 		console.log('\t\t' + (results.message || results.error) ? results.message ? results.message : '' : results.error ? results.error : 'failed');

// // 		return { success: results };
// // 	}
// // 	finally {
// // 		console.log('\t...updating version completed.');
// // 	}
// // }

// (async () => {
// 	try {
// 		Utility.initDateTime();

// 		// https://github.com/lorenwest/node-config/wiki
// 		const appConfig = config.get('app');

// 		function inject(injector, services, key, service) {
// 			console.log(`services.inject - ${key}`);
// 			services.set(key, service);
// 			injector.addSingleton(key, service);
// 		}

// 		function injectR(injector, repositories, key, repository) {
// 			console.log(`repositories.inject - ${key}`);
// 			repositories.set(key, repository);
// 			injector.addSingleton(key, repository);
// 		}

// 		injector.addSingleton(LibraryCommonConstants.InjectorKeys.SERVICE_CONFIG, config);

// 		const services = new Map();
// 		const loggerServiceI = new loggerService();

// 		// inject(injector, services, LibraryCommonConstants.InjectorKeys.SERVICE_MONITORING, new appMetricsMonitoringService());
// 		inject(injector, services, Constants.InjectorKeys.SERVICE_LOGGER_PINO, new pinoLoggerService());
// 		inject(injector, services, Constants.InjectorKeys.SERVICE_LOGGER_WISTON, new winstonLoggerService());
// 		inject(injector, services, LibraryCommonConstants.InjectorKeys.SERVICE_LOGGER, loggerServiceI);
// 		loggerServiceI.register(Constants.InjectorKeys.SERVICE_LOGGER_PINO);
// 		loggerServiceI.register(Constants.InjectorKeys.SERVICE_LOGGER_WISTON);

// 		for (const [key, value] of services) {
// 			console.log(`services.init - ${key}`);
// 			await value.init(injector);
// 		}

// 		try {
// 			// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
// 			// const octokit = new Octokit({ auth: config.token });

// 			// let library = 'library_cli';
// 			// await processLibrary(library, octokit);
// 		}
// 		catch (err) {
// 			loggerServiceI.exception('Build', 'init', err);
// 		}
// 	}
// 	catch (err) {
// 		console.error(err);
// 	}
// })();
