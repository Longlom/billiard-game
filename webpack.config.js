const path = require('path');

module.exports = {
  // Entry point for the application
  entry: './src/index.ts',

  // Output configuration, including where Webpack will save the compiled bundle
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

  // Configure how different modules (file types) will be treated
  module: {
    rules: [
      {
        test: /\.tsx?$/,       // Matches .ts or .tsx files
        use: 'ts-loader',      // Use ts-loader to transpile TypeScript to JavaScript
        exclude: /node_modules/, // Exclude dependencies from node_modules
      },
    ],
  },

  resolve: {
    extensions: [ '.ts', '.js'],
  },

  devServer: {
    static: './public',
    open: true,
    port: 8080,
  },
  devtool: 'source-map',
};
