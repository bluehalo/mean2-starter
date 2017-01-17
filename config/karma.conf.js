// Karma configuration
// Generated on Wed Dec 14 2016 15:07:52 GMT-0500 (EST)

const includeCodeCoverage = !!process.env.CODE_COVERAGE_ENABLED;
const webpackEnvironment = includeCodeCoverage ? 'test-coverage' : 'test';

const webpackConfig = require('./build/webpack.conf')(webpackEnvironment);

const karmaTestShim = includeCodeCoverage ? './karma-test-shim-coverage.js' : './karma-test-shim.js';

const karmaReporters = ['mocha'];

if(includeCodeCoverage) {
	karmaReporters.push('coverage', 'karma-remap-istanbul');
}

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
		{pattern: karmaTestShim, watched: false}
	],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
		'./karma-test-shim*.js': ['webpack', 'sourcemap']
    },

	webpack: webpackConfig,

	webpackMiddleware: {
		stats: 'errors-only'
	},


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: karmaReporters,

	coverageReporter: {
		type: 'in-memory'
	},

	remapIstanbulReporter: {
		reports: {
			'text-summary': null,
			html: './reports/coverage/client/lcov-report',
			lcovonly: './reports/coverage/client/lcov.info'
		}
	},

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
