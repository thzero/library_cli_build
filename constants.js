const Constants = {
	InjectorKeys: {
		SERVICE_BUILD: 'serviceBuild',
		SERVICE_BUILD_STANDARD: 'serviceBuildStandard',
		SERVICE_BUILD_ACTION_SOURCE_LOCAL_COMMIT: 'serviceBuildActionSourceLocalCommit',
		SERVICE_BUILD_ACTION_SOURCE_LOCAL_STATUS: 'serviceBuildActionSourceLocalStatus',
		SERVICE_BUILD_ACTION_SOURCE_REMOTE: 'serviceBuildActionSourceRemote',
		SERVICE_BUILD_ACTION_DEPENDENCY_UPDATE: 'serviceBuildActionDependencyUpdate',
		SERVICE_BUILD_ACTION_VERSION: 'serviceBuildVersion',

		SERVICE_LOGGER_PINO: 'serviceLoggerPino',
		SERVICE_LOGGER_WISTON: 'serviceLoggerWinston'
	},
	BuildTags: {
		Standard: 'Standard'
	}
}

export default Constants;
