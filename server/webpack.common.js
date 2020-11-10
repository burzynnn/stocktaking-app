const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    target: "node",
    node: {
        __dirname: false,
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                use: "babel-loader",
                exclude: /(node_modules)/,
                test: /\.js$/,
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(__dirname, "src", "public"), to: path.join(__dirname, "dist", "public") },
            ],
        }),
    ],
};
