const path = require('path');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        main: "./src/parser.ts",
    },
    output: {
        path: __dirname,
        globalObject: 'this',
        publicPath: '',
        filename: "main.js"
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    externalsPresets: { node: true },

    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: "ts-loader"
            }
        ]
    }
};
