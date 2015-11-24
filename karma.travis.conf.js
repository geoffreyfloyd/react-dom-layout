var webpack = require('webpack');
module.exports = function (config) {
    var sharedConfig = require('./karma.shared.conf.js')(config);
    sharedConfig.browsers = ['PhantomJS'];
    config.set(sharedConfig);
};