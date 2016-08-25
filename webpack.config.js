const webpack = require('webpack');

module.exports = {
  entry: {
    quote: './quoteApp.js',
    stats: './stats/app.js',
    tickets: './tickets/app.js',
  },
  output: {
    path: './build',
    filename: '[name].js',
  },
  module: {
    loaders: [
      { test: /\.css$/, exclude: /\.useable\.css$/, loader: "style!css" },
      { test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader'], },
      { test: /\.tsx$/, exclude: /node_modules/, loaders: ['ts-loader'], }
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
