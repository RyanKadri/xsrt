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
                use: ['style-loader', 'css-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: 'raw-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new WriteFilePlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html']
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
    },
    devServer: {
        contentBase: path.join(__dirname, 'src'),
        port: 3000,
        publicPath: 'http://localhost:3000/dist',
        //hotOnly: true
        hot: false, //Doing this until I have a better approach for the bookmarklet
        inline: false
    },
    mode: 'development'
}