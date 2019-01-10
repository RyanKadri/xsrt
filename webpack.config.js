const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = (output) => ({
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, output),
        publicPath: "/",
    },
    plugins: [
        new CleanWebpackPlugin([output]),
        //new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: 'raw-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    }
});

const frontendCommon = merge(common('dist/web/'), {
    entry: {
        viewer: './src/viewer/index.tsx',
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /\/node_modules\//,
                    name: "vendor",
                    chunks: "initial",
                },
            },
        },
    },
    resolve: {
        extensions: ['.tsx', '.html'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/viewer/index.html',
            meta: {
                charset: "UTF-8",
                viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
            },
            hash: true
        })
    ]
})

module.exports = [
    merge(frontendCommon, {
        name: 'viewer-dev',
        plugins: [
        ],
        
        devServer: {
            contentBase: path.join(__dirname, 'src/viewer'),
            port: 3000,
            publicPath: 'http://localhost:3000/',
            historyApiFallback: true,
            hot: false,
            inline: true,
            proxy: {
                '/api': 'http://localhost:3001',
                '/screenshots': 'http://localhost',
                '/assets': 'http://localhost',
            },
        },
        mode: 'development'
    }),
    merge(frontendCommon, {
        name: 'viewer-prod',
        plugins: [
            new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
        ],
        mode: 'production'
    }),
    merge(common('dist/bootstrap'), {
        name: 'bootstrap-scripts',
        entry: {
            ['scraper-bootstrap']: './src/scraper/bootstrap/scraper-bootstrap.ts',
            ['screenshot-bootstrap']: './src/viewer/bootstrap/bootstrap-screenshot.ts',
        },
    }),
    merge(common('dist/extension'), {
        name: 'compile-extension',
        resolve: {
            extensions: ['.tsx', '.html'],
        },
        entry: {
            ['bootstrap']: './src/extension/bootstrap/extension-bootstrap.ts',
            ['background']: './src/extension/background/background.ts',
            ['content']: './src/extension/content/extension-content.ts',
            ['popup']: './src/extension/popup/index.tsx'
        },
        plugins: [
            new CopyWebpackPlugin([{ from: "./src/extension/**/*.{json,png,html,svg}", to: './', flatten: true } ])
        ]
    })
];