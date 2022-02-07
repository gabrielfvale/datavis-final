const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const appDirectory = fs.realpathSync(process.cwd());

const resolveAppPath = (relativePath) =>
  path.resolve(appDirectory, relativePath);

module.exports = {
  mode: "development",

  entry: resolveAppPath("src/app.js"),

  output: {
    filename: "static/js/bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: resolveAppPath("src"),
        loader: "babel-loader",
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: resolveAppPath("public/index.html"),
    }),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    hot: true,
    liveReload: true,
    port: 3000,
  },
};
