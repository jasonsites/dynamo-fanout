const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  target: 'node',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: `${__dirname}/dist`,
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
      },
    }],
  },
  devtool: 'source-map',
  plugins: [
    new UglifyJSPlugin({
      parallel: true,
      sourceMap: true,
    }),
  ],
  externals: {
    'aws-sdk': 'aws-sdk',
  },
}
