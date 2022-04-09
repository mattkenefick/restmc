const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public/script'),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};
