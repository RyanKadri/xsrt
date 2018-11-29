const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: {
        ['scraper-bootstrap']: './src/scraper/bootstrap/scraper-bootstrap.ts',
        viewer: './src/viewer/index.tsx',
        ['screenshot-bootstrap']: './src/viewer/bootstrap/bootstrap-screenshot.ts'
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
        //new webpack.HotModuleReplacementPlugin(),
        new BundleAnalyzerPlugin(),
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "initial",
                },
            },
        },
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html'],
        alias: {
            '@common': path.resolve(__dirname, "src/common/"),
            '@scraper': path.resolve(__dirname, "src/scraper/")
        }
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
            '/api': 'http://localhost:3001',
            '/screenshots': 'http://localhost',
        }
    },
    mode: 'development'
};