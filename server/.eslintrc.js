module.exports = {
    parser: "babel-eslint",
    env: {
        es2020: true,
        node: true,
    },
    extends: ["airbnb-base"],
    parserOptions: {
        ecmaVersion: 11,
        sourceType: "module",
    },
    rules: {
        indent: ["error", 4],
        quotes: ["error", "double"],
    },
};
