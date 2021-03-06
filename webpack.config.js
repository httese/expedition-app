const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');
const port = process.env.DOCKER_PORT || 8082;

const options = {
  cache: true,
  entry: [
    'whatwg-fetch',
    'promise-polyfill',
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/only-dev-server',
    './app/Init.tsx',
    './app/Style.scss',
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
  devServer: {
    host: '0.0.0.0',
    contentBase: path.join(__dirname, "app"),
    disableHostCheck: true,
    publicPath: '/',
    port: port,
    hot: true,
    quiet: false,
    noInfo: false,
    historyApiFallback: true
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.tsx$/, loader: 'tslint-loader', exclude: /node_modules/ },
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader',
        options: { name: '[name].[ext]' }, // disable filename hashing for infrequently changed static assets to enable preloading
      },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'], exclude: /node_modules\/((?!expedition\-qdl).)*$/ },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
        'API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
        'OAUTH2_CLIENT_ID': JSON.stringify(process.env.OAUTH2_CLIENT_ID || '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com'),
      },
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // Don't import bloated Moment locales
    new CopyWebpackPlugin([
      { from: { glob: 'node_modules/expedition-art/icons/*.svg' }, flatten: true, to: './images' },
      { from: { glob: 'node_modules/expedition-art/art/*.png' }, flatten: true, to: './images' },
    ]),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({ // This MUST go last to ensure proper test config
      options: {
        tslint: {
          emitErrors: true,
          failOnHint: true,
          tsConfigFile: 'tsconfig.json',
        },
        babel: {
          presets: [["env", {
            "targets": {"browsers": [">5%", "last 2 years", "last 3 iOS versions", "chrome >= 39"]}
          }]],
          cacheDirectory: true,
        },
      },
    }),
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
}

module.exports = options;
