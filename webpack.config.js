require('dotenv').config();
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require("webpack-node-externals");
const DotEnv = require("dotenv-webpack");
const webpack = require("webpack");

const common = (output, tsconfig) => ({
  devtool: 'source-map',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, output),
    //publicPath: "/",
  },
  plugins: [
    new CleanWebpackPlugin(),
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
      // {
      //   test: /\.html$/,
      //   use: 'raw-loader'
      // }
    ]
  },
  resolve: {
    extensions: [".wasm", ".ts", ".tsx", ".mjs", ".cjs", ".js", ".json"],
  }
});

const frontendCommon = merge(common('dist/web', "packages/viewer/tsconfig.json"), {
  entry: {
    viewer: './packages/viewer/src/index.tsx',
  },
  output: {
    filename: '[name].[hash].bundle.js',
  },
  resolve: {
    extensions: [".wasm", ".ts", ".tsx", ".mjs", ".cjs", ".js", ".json"],
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
    new DotEnv()
  ],
  devServer: {
    historyApiFallback: true,
    hot: false,
    inline: false,
    contentBase: __dirname + "/storage"
  },
  mode: 'development'
});

const viewerProd = merge(frontendCommon, {
  name: 'viewer-prod',
  plugins: [
    new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    new webpack.EnvironmentPlugin(["API_HOST", "STATIC_HOST"])
  ],
  mode: 'production'
});

const recordingClient = merge(common('packages/recorder/lib', "packages/recorder/tsconfig.build.json"), {
  name: 'recording-client',
  output: {
    library: 'recorder',
    libraryTarget: 'umd',
    filename: 'index.js',
    auxiliaryComment: 'Test Comment'
  },
  plugins: [
    new BundleAnalyzerPlugin({ analyzerMode: "disabled" }), // Or just give no args for bundle analyzer
    new DotEnv()
  ],
  entry: {
    ['recorder']: './packages/recorder/src/index.ts'
  },
  mode: 'development'
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
    new CopyWebpackPlugin({
      patterns: [
        { from: "./packages/extension/src/**/*.{json,png,html,svg}", to: './', flatten: true }
      ]
    }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
  ],
  mode: "production"
});

const compileBackend = merge(common("dist/backend", "packages/api/tsconfig.build.json"), {
  name: 'compile-backend',
  devtool: 'inline-sourcemaps',
  externals: ["pg-native"],
  target: 'node',
  entry: {
    ['api-server']: './packages/api/src/index.ts',
    ['decorator-server']: './packages/decorators/src/index.ts'
  },
  mode: "development"
})

module.exports = [
  viewerDev,
  viewerProd,
  bootstrapScripts,
  compileExtension,
  recordingClient,
  compileBackend,
];
