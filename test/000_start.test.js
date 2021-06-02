/* eslint-disable func-names */
require("dotenv-json")();
const debug = require("debug");

let MongoConnection;
if (process.env.WEBPACK_TEST) {
  ({ MongoConnection } = require("../dist/bundle-local"));
} else {
  ({ MongoConnection } = require("../index"));
}

if (process.env.DEBUG_LEVEL === "off") {
  // swith off debugging
  console.log("no debug info");
  debug.disable();
}

const { getCleanDb } = require("./start-mongo.js");

before(async function() {
  this.timeout(20000);
  console.log("setup test env");
  await getCleanDb();
  const mongo = new MongoConnection(process.env.LOCAL_MONGO);
  await mongo.connect();
  console.log("Mongo connection set up!");
  // console.log("JWT_SECRET", process.env.JWT_SECRET);
});
