const { merge } = require("webpack-merge");

const webpackCommonConfig = require("./webpack.common");

module.exports = merge(webpackCommonConfig, {
    mode: "development",
    optimization: {
        minimize: false,
    },
    devtool: "inline-source-map",
    watchOptions: {
        poll: true,
    },
});
