const path = require("path");
const { merge } = require("webpack-merge");
// eslint-disable-next-line import/no-extraneous-dependencies
const NodemonPlugin = require("nodemon-webpack-plugin");

const webpackCommonConfig = require("./webpack.common");

module.exports = merge(webpackCommonConfig, {
    entry: ["./src/index.js"],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.bundle.js",
    },
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
