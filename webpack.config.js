const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');

const common = (output) => ({
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, output),
        publicPath: "/" + output,
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
        alias: {
            '@common': path.resolve(__dirname, "src/common/"),
            '@scraper': path.resolve(__dirname, "src/scraper/")
        }
    }
});

module.exports = [
    merge(common('dist/web'), {
        name: 'viewer-frontend',
        entry: {
            viewer: './src/viewer/index.tsx',
        },
        module: {
            rules: [
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
                }
            ]
        },
        plugins: [
            new WriteFilePlugin(),
            new webpack.HotModuleReplacementPlugin(),
        ],
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
        devServer: {
            contentBase: path.join(__dirname, 'src/viewer'),
            port: 3000,
            publicPath: 'http://localhost:3000/dist/web',
            historyApiFallback: true,
            hot: true,
            inline: true,
            proxy: {
                '/api': 'http://localhost:3001',
                '/screenshots': 'http://localhost',
                '/assets': 'http://localhost',
            },
        },
        mode: 'development'
    }), 
    merge(common('dist/bootstrap'), {
        name: 'bootstrap-scripts',
        entry: {
            ['scraper-bootstrap']: './src/scraper/bootstrap/scraper-bootstrap.ts',
            ['screenshot-bootstrap']: './src/viewer/bootstrap/bootstrap-screenshot.ts'
        },
    }),
    merge(common('dist/backend'), {
        name: 'backend-servers',
        entry: {
            ['api-server']: './src/api/api-server.ts',
            ['decorate-server']: './src/decorators/decorator-server.ts'
        },
        target: "node",
        resolve: {
            extensions: ['json']
        }
    })
];