const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: ["./src/index.js"],
    target: "node",
    node: {
        __dirname: false,
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.bundle.js",
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
    plugins: [new CleanWebpackPlugin()],
};
