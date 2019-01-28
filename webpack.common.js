const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require("webpack-node-externals");

const common = (output) => ({
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, output),
        publicPath: "/",
    },
    plugins: [
        //new CleanWebpackPlugin([output], { beforeEmit: true } ),
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

const viewerDev = merge(frontendCommon, {
    name: 'viewer-dev',
    plugins: [
    ],

    devServer: {
        contentBase: path.join(__dirname, 'src/viewer'),
        port: process.env.WEBPACK_PORT,
        publicPath: `http://localhost:${process.env.WEBPACK_PORT}/`,
        historyApiFallback: true,
        hot: false,
        inline: true,
        host: '0.0.0.0',
        disableHostCheck: true,
        proxy: {
            '/api': process.env.API_SERVER,
            '/screenshots': process.env.STATIC_ASSET_SERVER,
            '/assets': process.env.STATIC_ASSET_SERVER,
        },
    },
    mode: 'development'
});

const viewerProd = merge(frontendCommon, {
    name: 'viewer-prod',
    plugins: [
        new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    ],
    mode: 'production'
});

const bootstrapScripts = merge(common('dist/bootstrap'), {
    name: 'bootstrap-scripts',
    entry: {
        ['scraper-bootstrap']: './src/scraper/bootstrap/scraper-bootstrap.ts',
        ['screenshot-bootstrap']: './src/viewer/bootstrap/bootstrap-screenshot.ts',
    },
});

const compileExtension = merge(common('dist/extension'), {
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
});

const compileBackend = merge(common('dist/backend'), {
    name: 'compile-backend',
    target: 'node',
    externals: [nodeExternals()],
    entry: {
        'api-service': './src/api/api-server.ts',
        'decorator-service': './src/decorators/decorator-server.ts'
    },
    resolve: {
        extensions: ['.node'],
    },
    module: {
        rules: [
            { test: /\.node$/, loader: 'node-loader' },
        ]
    },
    mode: "production",
    devtool: 'inline-source-map'
});

module.exports = {
    viewerDev,
    viewerProd,
    bootstrapScripts,
    compileExtension,
    compileBackend
};