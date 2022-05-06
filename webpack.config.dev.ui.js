const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const commonDevConfig = require('./webpack.config.dev');

module.exports = merge(commonDevConfig, {
    entry: './ui/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        library: 'reagentUi',
        libraryTarget: 'umd',
        globalObject: 'this',
        publicPath: ''
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Reagent | development',
            template: 'ui/index.html'
        })
    ]
});
