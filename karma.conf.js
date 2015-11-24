var webpack = require('webpack');
module.exports = function (config) {
    config.set({

        /**
         * Start these browsers for testing. PhantomJS is a headless browser.
         * Available browsers: https://npmjs.org/browse/keyword/karma-launcher
         * 'Chrome', 'Firefox', 'IE', 'PhantomJS'
         */
        browsers: ['PhantomJS'],

        reporters: ['mocha'],

        /**
         * These are the files required to run the tests.
         *
         * The `Function.prototype.bind` polyfill is required by PhantomJS
         * because it uses an older version of JavaScript.
         */
        files: [
            'tests.webpack.js',
            'test/Core-test.jsx',
            'test/Layout-test.jsx',
            'test/SplitLayout-test.jsx'
        ],

        /**
         * The actual tests are preprocessed by the karma-webpack plugin, so that
         * their source can be properly transpiled.
         */
        preprocessors: {
            'tests.webpack.js': ['webpack'],
            'test/Core-test.jsx': ['webpack'],
            'test/Layout-test.jsx': ['webpack'],
            'test/SplitLayout-test.jsx': ['webpack']
        },

        /**
        * level of logging
        * possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        */
        logLevel: config.LOG_INFO,

        /**
         * Use Mocha as the test framework, Sinon for mocking, and
         * Chai for assertions.
         */
        frameworks: ['mocha', 'chai'],

        /**
         * The configuration for the karma-webpack plugin.
         * This is very similar to the main webpack.local.config.js.
         */
        webpack: {
            module: {
                loaders: [
                    { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' }
                ]
            },
            resolve: {
                extensions: ['', '.js', '.jsx']
            },
            watch: true
        },

        /**
         * Turn off verbose logging of webpack compilation.
         */
        webpackServer: {
            noInfo: true
        },

        singleRun: true,

        /**
         * Array of plugins used
         */
        plugins: [
          require('karma-chrome-launcher'),
          require('karma-firefox-launcher'),
          require('karma-ie-launcher'),
          require('karma-phantomjs-launcher'),
          require('karma-mocha'),
          require('karma-mocha-reporter'),
          require('karma-chai'),
          require('karma-webpack')
        ],

        //client: {
        //    mocha: {
        //        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        //        ui: 'tdd'
        //    }
        //}
    });
};