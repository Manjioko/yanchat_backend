// import path from 'path';
// // import nodeExternals from 'webpack-node-externals';
// import CopyWebpackPlugin from 'copy-webpack-plugin';
// import { webpack } from 'webpack';

const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
// import IgnoreEmitPlugin from 'ignore-emit-webpack-plugin';

module.exports =  {
  target: 'node',
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'pack'),
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(node)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: 'public' },
        { from: 'avatar', to: 'avatar' },
        // Add more patterns for other folders
      ],
    })
    // new IgnoreEmitPlugin(/\/express\/|\/knex\//),
  ],
};
