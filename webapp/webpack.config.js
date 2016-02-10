var webpack = require("webpack");

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './frontend/site',
  ],
  output: {
    path: './static',
    filename: 'frontend.js',
    publicPath: '/static/',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  externals: {
    jquery: "jQuery",
    React: "React",
    _: "_",
    Backbone: "Backbone"
  },
  resolve: {
    extensions: ['', '.js'],
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/
    }]
  }
};
