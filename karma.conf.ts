import { Config, ConfigOptions } from "karma";

const webpackConf = require('./webpack.config');

module.exports = function(config: Config) {
  const options: ConfigOptions & {[pluginConf: string]: any} = {
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      {
        pattern: './src/test.ts',
        watched: false
      }
    ],
    preprocessors: {
      './src/test.ts': ['webpack']
    },
    plugins: [
      require('karma-webpack'),
      require('karma-jasmine'),
      require('karma-sourcemap-loader'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-typescript-preprocessor')
    ],

    // Splitting this is important. Looks like some webpack settings in the full build screw with Karma
    webpack: {
      module: webpackConf.module,
      resolve: webpackConf.resolve,
      mode: 'development'
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity,
    browserNoActivityTimeout: 999999999 // 10 days. That'll do
  };
  config.set(options);
}