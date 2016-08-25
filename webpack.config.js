const webpack = require('webpack');

module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    path: './build',
    filename: '[name].js',
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader'], },
    ]
  },
  plugins: [
    //new webpack.DefinePlugin({
      //"process.env": { NODE_ENV: JSON.stringify("production") }
    //}),
    //new webpack.optimize.UglifyJsPlugin({
      //mangle: false,
      //compress: { warnings: false, },
      //output: { comments: false, },
    //}),
  ]
}
