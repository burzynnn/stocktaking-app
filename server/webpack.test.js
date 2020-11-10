const path = require("path");
const { merge } = require("webpack-merge");

const webpackCommonConfig = require("./webpack.common");

module.exports = merge(webpackCommonConfig, {
    entry: "./tests/test.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.test.js",
    },
    mode: "development",
    optimization: {
        minimize: false,
    },
    devtool: "source-map",
    watchOptions: {
        poll: true,
    },
});
