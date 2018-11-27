const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
    entry: {
        ['scraper-bootstrap']: './src/scraper/bootstrap/scraper-bootstrap.ts',
        viewer: './src/viewer/index.tsx',
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            camelCase: true,
                            localIdentName: '[name]-[local]-[hash:base64:5]'
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: 'raw-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist/web']),
        new WriteFilePlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html']
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist/web'),
        publicPath: '/dist/web',
    },
    devServer: {
        contentBase: path.join(__dirname, 'src/viewer'),
        port: 3000,
        publicPath: 'http://localhost:3000/dist/web',
        historyApiFallback: true,
        hot: false, //Doing this until I have a better approach for the bookmarklet
        inline: false,
        proxy: {
            '/api': 'http://localhost:3001'
        }
    },
    mode: 'development'
};