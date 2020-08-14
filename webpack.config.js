const path = require("path");
const webpack = require("webpack");

const plugins = [
  new webpack.ContextReplacementPlugin(/.*/),
  new webpack.IgnorePlugin(/^pg-native$/),
  new webpack.IgnorePlugin(/^mongodb-client-encryption$/),
  new webpack.IgnorePlugin(/^hiredis$/)
];

module.exports = {
  optimization: { minimize: true },
  entry: process.env.ENTRY_FILE,
  plugins,
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: `bundle${process.env.WEBPACK_TEST ? "-local" : ""}.js`,
    libraryTarget: process.env.WEBPACK_TEST ? "umd" : undefined
  },
  mode: "production",

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"]
  },
  node: {
    __dirname: true
  },
  externals: {},
  target: "node",
  devtool: process.env.WEBPACK_TEST ? "source-map" : ""
};
const installedModules = [
  "amqplib",
  "apn",
  "async",
  "bent",
  "body-parser",
  "btoa",
  "cassandra-driver",
  "cloudant",
  "@cloudant/cloudant",
  "commander",
  "composeaddresstranslator",
  "consul",
  "cookie-parser",
  "cradle",
  "elasticsearch",
  "errorhandler",
  "etcd3",
  "express",
  "express-session",
  "formidable",
  "glob",
  "gm",
  "ibm-cos-sdk",
  "ibm_db",
  "ibmiotf",
  "iconv-lite",
  "jsdom",
  "jsonwebtoken",
  "lodash",
  "log4js",
  "marked",
  "merge",
  "moment",
  "mongodb",
  "mysql",
  "mustache",
  "nano",
  "nodemailer",
  "oauth2-server",
  "openwhisk",
  "path-to-regex",
  "pg",
  "process",
  "pug",
  "redis",
  "request",
  "request-promise",
  "rimraf",
  "semver",
  "@sendgrid/mail@6.3.1",
  "serve-favicon",
  "superagent",
  "twilio",
  "underscore",
  "url-pattern",
  "uuid",
  "validator",
  "watson-developer-cloud",
  "when",
  "winston",
  "ws",
  "xml2js",
  "xmlhttprequest",
  "yauzl"
];
if (!process.env.WEBPACK_TEST) {
  console.log("prepare file for production env!");
  installedModules.forEach(
    // eslint-disable-next-line no-return-assign
    nodeModule =>
      (module.exports.externals[nodeModule] = `commonjs ${nodeModule}`)
  ); // don't bundle externals; leave as require('module')
}
