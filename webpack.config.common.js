const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        library: 'reagent',
        libraryTarget: 'umd',
        globalObject: 'this',
        publicPath: ''
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.mjs', 'css', 'scss', '.module.css', '.module.scss'],
        alias: {
            hypotenuse: path.resolve(__dirname, 'node_modules/@mtbjorn/hypotenuse/dist/')
        }
    },
    module: {
        rules: [
            {
                test: /\.m?jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-inline-svg"
                                ],
                            }
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    }
                ],
                include: /\.module\.s[ac]ss$/
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    'css-loader',
                    "sass-loader"
                ],
                exclude: /\.module\.s[ac]ss$/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
};
