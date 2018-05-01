const ExtractTextPlugin = require('extract-text-webpack-plugin');

// const isDebug = !process.argv.includes('--release');



module.exports = {
  entry: {
    main: './_js/main.js',
  },
  output: {
    filename: './public/js/[name].js',
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader'}),
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader!sass-loader'}),
      },
      {
        test: /\.(png|jpg|)$/,
        loader: 'url-loader?limit=200000',
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file-loader?name=[name].[ext]&outputPath=public/assets/images/',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('./public/css/[name].css'),
  ],
};
