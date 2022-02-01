// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  entry: "./main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.js"
  },
  plugins: [new MonacoWebpackPlugin()]
};
