require('dotenv').load();
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require("webpack-node-externals");

const common = (output, tsconfig) => ({
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, output),
        //publicPath: "/",
    },
    plugins: [
        new CleanWebpackPlugin({
          cleanAfterEveryBuildPatterns: ["**/*"]
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, tsconfig),
                    }
                }],
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: 'raw-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts','.js'],
        alias: {
            "@xsrt/common": path.resolve(__dirname,  "packages/common/src"),
            "@xsrt/common-backend": path.resolve(__dirname, "packages/common-backend/src"),
            "@xsrt/common-frontend": path.resolve(__dirname, "packages/common-frontend/src"),
            "@xsrt/recorder": path.resolve(__dirname, "packages/recorder/src")
        }
    }
});

const frontendCommon = merge(common('dist/web', "packages/viewer/tsconfig.json"), {
    entry: {
        viewer: './packages/viewer/src/index.tsx',
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
            template: './packages/viewer/src/index.html',
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
        contentBase: path.join(__dirname, 'packages/viewer/lib'),
        port: process.env.WEBPACK_PORT,
        publicPath: `http://localhost:${process.env.WEBPACK_PORT}/`,
        historyApiFallback: true,
        hot: false,
        inline: true,
        host: '0.0.0.0',
        disableHostCheck: true,
        proxy: {
            '/api': process.env.API_SERVER || `http://localhost:${process.env.API_PORT}`,
            '/screenshots': { target: process.env.STATIC_ASSET_SERVER, secure:false },
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

const recordingClient = merge(common('dist/recorder', "packages/recorder/tsconfig.json"), {
    name: 'recording-client',
    plugins: [
        new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    ],
    entry: {
        ['recorder']: './packages/recorder/src/public_api.ts'
    },
    mode: 'production'
})

const bootstrapScripts = merge(common('dist/bootstrap', "packages/viewer/tsconfig.json"), {
    name: 'bootstrap-scripts',
    entry: {
        ['screenshot-bootstrap']: './packages/viewer/src/bootstrap/bootstrap-screenshot.ts',
    },
    resolve: {
        extensions: ['.tsx'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            meta: {
                charset: "UTF-8",
                viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
            },
            hash: true
        })
    ],
    mode: 'production'
});

const compileExtension = merge(common('packages/extension/dist', 'packages/extension/tsconfig.json'), {
    name: 'compile-extension',
    resolve: {
        extensions: ['.tsx', '.html'],
    },
    entry: {
        ['bootstrap']: './packages/extension/src/bootstrap/extension-bootstrap.ts',
        ['background']: './packages/extension/src/background/background.ts',
        ['content']: './packages/extension/src/content/extension-content.ts',
        ['popup']: './packages/extension/src/popup/index.tsx'
    },
    plugins: [
        new CopyWebpackPlugin([{ from: "./packages/extension/src/**/*.{json,png,html,svg}", to: './', flatten: true } ]),
        new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    ],
    mode: "production"
});

const compileBackend = merge(common("dist/backend", "packages/api/tsconfig.json"), {
    name: 'compile-backend',
    devtool: 'inline-sourcemaps',
    externals: [nodeExternals()],
    target: 'node',
    entry: {
        ['api-server']: './packages/api/src/api-server.ts',
        ['decorator-server']: './packages/decorators/src/decorator-server.ts'
    },
    mode: "development"
})

module.exports = [
    viewerDev,
    viewerProd,
    bootstrapScripts,
    compileExtension,
    recordingClient,
    compileBackend
];
