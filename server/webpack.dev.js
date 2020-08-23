const { merge } = require("webpack-merge");
// eslint-disable-next-line import/no-extraneous-dependencies
const NodemonPlugin = require("nodemon-webpack-plugin");

const webpackCommonConfig = require("./webpack.common");

module.exports = merge(webpackCommonConfig, {
    mode: "development",
    optimization: {
        minimize: false,
    },
    devtool: "inline-source-map",
    plugins: [new NodemonPlugin({
        legacyWatch: true,
    })],
    watchOptions: {
        poll: true,
    },
});
